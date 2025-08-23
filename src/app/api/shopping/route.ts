import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { connectToDatabase } from "@/lib/db";
import { ONE_HOUR_SECONDS, redisSet, getRedisKeyForQuery } from "@/lib/redis";
import { getProducts, normalizeQuery } from "@/lib/search";
import { getTurkishKeywordsForPersianQuery } from "@/lib/tr-fa-mapping";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

// Simple in-memory cache for search results
const searchCache = new Map<
  string,
  {
    data: any;
    timestamp: number;
    ttl: number;
  }
>();

// Cache duration: 5 minutes for searches
const SEARCH_CACHE_TTL = 5 * 60 * 1000;

// Function to determine query type based on keywords
function getQueryType(query: string): string {
  // حیوانات خانگی - بررسی اول برای اولویت بالاتر
  const petsKeywords = [
    "حیوانات خانگی",
    "حیوانات",
    "pets",
    "pet",
    "petshop",
    "سگ",
    "dog",
    "گربه",
    "cat",
    "حیوان خانگی",
    "pet",
    "غذای سگ",
    "غذای گربه",
    "تشویقی سگ",
    "تشویقی گربه",
    "قلاده",
    "محصولات بهداشتی حیوانات",
  ];

  // ورزشی - بررسی دوم
  const sportsKeywords = [
    "ورزشی",
    "sport",
    "sports",
    "spor",
    "ورزش",
    "فیتنس",
    "fitness",
    "دویدن",
    "running",
    "ساک ورزشی",
    "لوازم ورزشی",
    "کفش ورزشی",
    "لباس ورزشی",
    "ترموس",
    "قمقمه",
    "اسباب ورزشی",
  ];

  // ویتامین و دارو
  const vitaminKeywords = [
    "ویتامین",
    "vitamin",
    "vitaminler",
    "دارو",
    "medicine",
    "مکمل",
    "supplement",
    "takviye",
    "sağlık",
    "saglik",
    "مولتی ویتامین",
    "کلسیم",
    "ملاتونین",
  ];

  // زیبایی و آرایش
  const beautyKeywords = [
    "زیبایی",
    "آرایش",
    "beauty",
    "güzellik",
    "guzellik",
    "cosmetics",
    "kozmetik",
    "makeup",
    "perfume",
    "cologne",
    "لوازم آرایشی",
    "عطر",
    "ادکلن",
    "مراقبت از پوست",
    "ضد پیری",
    "محصولات آفتاب",
    "رنگ مو",
    "شامپو",
  ];

  // الکترونیک
  const electronicsKeywords = [
    "الکترونیک",
    "electronics",
    "elektronik",
    "elektronık",
    "موبایل",
    "mobile",
    "لپ تاپ",
    "laptop",
    "تبلت",
    "tablet",
    "هدفون",
    "headphone",
    "ساعت هوشمند",
    "smartwatch",
  ];

  // مد و پوشاک - بررسی آخر برای جلوگیری از تداخل
  const fashionKeywords = [
    "مد",
    "پوشاک",
    "fashion",
    "moda",
    "giyim",
    "kıyafet",
    "kiyafet",
    "clothing",
    "dress",
    "shirt",
    "pants",
    "jeans",
    "skirt",
    "blouse",
    "t-shirt",
    "sweater",
    "jacket",
    "coat",
    "پیراهن",
    "تاپ",
    "شلوار",
    "شومیز",
    "دامن",
    "ژاکت",
    "کت",
    "کیف",
    "کیف دستی",
    "jewelry",
    "جواهرات",
    "زیورآلات",
  ];

  // تشخیص نوع کوئری با اولویت‌بندی
  if (petsKeywords.some((keyword) => query.includes(keyword))) {
    return "pets";
  } else if (sportsKeywords.some((keyword) => query.includes(keyword))) {
    return "sports";
  } else if (vitaminKeywords.some((keyword) => query.includes(keyword))) {
    return "vitamins";
  } else if (beautyKeywords.some((keyword) => query.includes(keyword))) {
    return "beauty";
  } else if (electronicsKeywords.some((keyword) => query.includes(keyword))) {
    return "electronics";
  } else if (fashionKeywords.some((keyword) => query.includes(keyword))) {
    return "fashion";
  }

  return "other";
}

// Function to extract and validate product links from SERP API
function extractProductLink(product: any): string | null {
  // List of valid store domains we want to accept
  const validStoreDomains = [
    "hepsiburada.com",
    "trendyol.com",
    "n11.com",
    "gittigidiyor.com",
    "amazon.com.tr",
    "amazon.com",
    "amazon.de",
    "amazon.co.uk",
    "ebay.com",
    "ebay.de",
    "ebay.co.uk",
    "etsy.com",
    "asos.com",
    "zara.com",
    "hm.com",
    "mango.com",
    "pullandbear.com",
    "bershka.com",
    "stradivarius.com",
    "massimodutti.com",
    "oysho.com",
    "zara.com.tr",
    "hm.com.tr",
    "mango.com.tr",
    "sephora.com",
    "sephora.com.tr",
    "douglas.com",
    "douglas.com.tr",
    "flormar.com.tr",
    "goldenrose.com.tr",
    "lorealparis.com.tr",
    "maybelline.com.tr",
    "nyxcosmetics.com.tr",
    "mac.com.tr",
    "benefitcosmetics.com.tr",
    "clinique.com.tr",
    "esteelauder.com.tr",
    "lancome.com.tr",
    "dior.com",
    "chanel.com",
    "ysl.com",
    "gucci.com",
    "prada.com",
    "louisvuitton.com",
    "hermes.com",
    "cartier.com",
    "tiffany.com",
    "swarovski.com",
    "pandora.com",
    "cartier.com.tr",
    "tiffany.com.tr",
    "swarovski.com.tr",
    "pandora.com.tr",
  ];

  // Function to check if URL is from a valid store
  function isValidStoreUrl(url: string): boolean {
    if (!url || typeof url !== "string") return false;

    // Exclude Google Shopping links
    if (
      url.includes("google.com/shopping") ||
      url.includes("google.com.tr/shopping") ||
      url.includes("google.com/search?tbm=shop")
    ) {
      return false;
    }

    // Check if URL contains any valid store domain
    return validStoreDomains.some((domain) => url.includes(domain));
  }

  // Priority order for extracting product links
  const linkSources = [
    product.merchant?.link,
    product.merchant?.url,
    product.source_link,
    product.product_link,
    product.offers?.link,
    product.offers?.url,
    product.link,
  ];

  // Debug: Log all available links for this product
  console.log(`🔍 Debugging product: ${product.title}`);
  console.log(`  Available links:`);
  linkSources.forEach((link, index) => {
    if (link) {
      console.log(`    ${index + 1}. ${link}`);
    }
  });

  // Find the first valid store link
  for (const link of linkSources) {
    if (link && isValidStoreUrl(link)) {
      console.log(`✅ Found valid store link: ${link}`);
      return link;
    }
  }

  // If no valid store link found, try to construct one from merchant domain
  if (product.merchant?.domain) {
    const domain = product.merchant.domain;
    console.log(`  Checking merchant domain: ${domain}`);
    if (
      domain &&
      !domain.includes("google.com") &&
      validStoreDomains.some((validDomain) => domain.includes(validDomain))
    ) {
      const constructedLink = `https://${domain}`;
      console.log(`✅ Constructed store link from domain: ${constructedLink}`);
      return constructedLink;
    }
  }

  // RELAXED FILTERING: Accept any non-Google link for better results
  console.log(
    `⚠️ No valid store link found, accepting any non-Google link for better results`
  );
  for (const link of linkSources) {
    if (link && !link.includes("google.com")) {
      console.log(`🔧 RELAXED: Accepting link: ${link}`);
      return link;
    }
  }

  // FINAL FALLBACK: Return Google Shopping link if nothing else works
  if (product.product_link) {
    console.log(
      `🔧 FINAL FALLBACK: Using Google Shopping link: ${product.product_link}`
    );
    return product.product_link;
  }

  console.log(`❌ No valid store link found for product: ${product.title}`);
  return null;
}

// High-quality TR→FA translator that preserves brand names and unclear words
async function translateTurkishToPersianKeepBrands(
  title: string,
  description: string
): Promise<{ title: string; description: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { title, description };
  }

  try {
    const prompt = `
      متن زیر ممکن است ترکی یا انگلیسی باشد. آن را به فارسی روان و قابل فهم برای فروش اینترنتی ترجمه کن.
      قوانین مهم:
      - نام برندها/مدل‌ها/نام‌های اختصاصی را تغییر نده و همان‌طور که هستند نگه‌دار (مثل Zade Vital, LC Waikiki, Maybelline, D3 Vitamini).
      - اگر کلمه‌ای معادل دقیق ندارد یا نام برند است، همان واژهٔ اصلی را حفظ کن.
      - اعداد، واحدها و درصدها را حفظ کن.
      - ترجمهٔ واضح، مختصر و طبیعی باشد؛ از کلمات نامانوس پرهیز کن.
      - فقط خروجی JSON معتبر بده با کلیدهای "title" و "description".
      - برای "description" حداکثر 25 کلمه و کاملاً قابل فهم بنویس.

      عنوان: ${title}
      توضیحات: ${description}

      خروجی:
      {"title":"...","description":"..."}
    `;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxOutputTokens: 220,
      temperature: 0.2,
    });

    try {
      const parsed = JSON.parse(text);
      return {
        title: parsed.title?.toString()?.trim() || title,
        description: parsed.description?.toString()?.trim() || description,
      };
    } catch {
      // If JSON parsing fails, fall back to original values
      return { title, description };
    }
  } catch {
    return { title, description };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const force =
      searchParams.get("force") === "1" || searchParams.get("force") === "true";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const normalized = normalizeQuery(query);

    console.log(`🔍 Starting search for query: "${query}"`);

    // Check if API keys are available
    if (!process.env.SERPAPI_KEY) {
      console.error("❌ SERPAPI_KEY is not configured");

      // Try to return cached products even if API is not configured
      try {
        const cachedProducts = await GoogleShoppingProduct.getCachedProducts(
          normalized,
          30
        );

        if (cachedProducts.length > 0) {
          console.log(
            `✅ Returning ${cachedProducts.length} cached products despite missing API key`
          );
          const formattedProducts = cachedProducts.map((p: any) => ({
            id: p.id,
            title: p.title_fa,
            originalTitle: p.title,
            price: parseFloat(p.price),
            image: p.thumbnail,
            link: p.link,
            source: p.source,
            createdAt: p.createdAt,
          }));

          const dbOnlyResponse = {
            products: formattedProducts,
            total: formattedProducts.length,
            search_query: query,
            query_type: "cached",
            message:
              "\u202Aبرای سفارش محصول روی + کلیک کنید تا محصول به سبد خرید انتقال داده بشه\u202C",
            cached: true,
            from_database: true,
            api_configured: false,
          };

          try {
            const redisKey = getRedisKeyForQuery(normalized);
            await redisSet(redisKey, dbOnlyResponse, { ex: ONE_HOUR_SECONDS });
          } catch {}

          return NextResponse.json(dbOnlyResponse);
        }
      } catch (dbError) {
        console.error("❌ Database connection failed:", dbError);
      }

      // If no cached products, redirect to sample products API
      console.log("🔄 Redirecting to sample products API");
      const sampleResponse = await fetch(
        `${request.nextUrl.origin}/api/shopping/sample-products?q=${encodeURIComponent(query)}`
      );
      const sampleData = await sampleResponse.json();

      return NextResponse.json({
        ...sampleData,
        message:
          "محصولات نمونه نمایش داده می‌شوند. برای نتایج واقعی، لطفاً API keys را تنظیم کنید.",
        api_configured: false,
        sample_data: true,
      });
    }

    const fetchProductsFromSerpApi = async (
      normalizedKey: string,
      originalQuery: string
    ) => {
      try {
        await connectToDatabase();
      } catch {}
      let queryType = getQueryType(originalQuery.toLowerCase());
      let cleanQuery = originalQuery.trim();
      const queryLower = cleanQuery.toLowerCase();
      const trKeywords = getTurkishKeywordsForPersianQuery(originalQuery);
      if (trKeywords.length > 0)
        cleanQuery = `${cleanQuery} ${trKeywords.join(" ")}`;
      if (queryLower.includes("men") || queryLower.includes("erkek"))
        cleanQuery = `${cleanQuery} erkek giyim erkek moda erkek kıyafet`;
      const randomVariations = [
        "kaliteli",
        "uygun fiyat",
        "en iyi",
        "popüler",
        "trend",
        "yeni",
        "özel",
        "indirimli",
        "ucuz",
        "premium",
        "marka",
        "orijinal",
      ];
      const randomWord =
        randomVariations[Math.floor(Math.random() * randomVariations.length)];
      if (Math.random() > 0.3) cleanQuery = `${cleanQuery} ${randomWord}`;
      let enhancedQuery = cleanQuery;
      if (process.env.OPENAI_API_KEY) {
        try {
          const prompt = `\n          من یک کوئری جستجو به زبان فارسی دارم که باید آن را برای جستجو در فروشگاه‌های آنلاین ترکیه بهبود دهم.\n\n          کوئری اصلی: "${cleanQuery}"\n\n          لطفاً:\n          1. این کوئری را به ترکی ترجمه کنید\n          2. آن را دقیق‌تر کنید\n          3. کلمات کلیدی مناسب برای جستجو در Google Shopping اضافه کنید\n          4. اگر کوئری خیلی عمومی است، آن را گسترش دهید\n\n          فقط کوئری بهبود یافته را به زبان ترکی برگردانید، بدون توضیح اضافی:\n        `;
          const { text } = await generateText({
            model: openai("gpt-3.5-turbo"),
            prompt,
            maxOutputTokens: 100,
            temperature: 0.3,
          });
          enhancedQuery = text.trim() || cleanQuery;
        } catch {}
      }
      const lowerQuery = enhancedQuery.toLowerCase();
      let isFashionQuery = false;
      const petsKeywords = [
        "حیوانات خانگی",
        "حیوانات",
        "pets",
        "سگ",
        "dog",
        "گربه",
        "cat",
        "حیوان خانگی",
        "pet",
        "غذای سگ",
        "غذای گربه",
        "تشویقی سگ",
        "تشویقی گربه",
        "قلاده",
        "محصولات بهداشتی حیوانات",
      ];
      const sportsKeywords = [
        "ورزشی",
        "sport",
        "sports",
        "ورزش",
        "فیتنس",
        "fitness",
        "دویدن",
        "running",
        "ساک ورزشی",
        "لوازم ورزشی",
        "کفش ورزشی",
        "لباس ورزشی",
        "ترموس",
        "قمقمه",
        "اسباب ورزشی",
      ];
      const vitaminKeywords = [
        "ویتامین",
        "vitamin",
        "دارو",
        "medicine",
        "مکمل",
        "supplement",
        "مولتی ویتامین",
        "کلسیم",
        "ملاتونین",
      ];
      const beautyKeywords = [
        "زیبایی",
        "آرایش",
        "beauty",
        "cosmetics",
        "makeup",
        "perfume",
        "cologne",
        "لوازم آرایشی",
        "عطر",
        "ادکلن",
        "مراقبت از پوست",
        "ضد پیری",
        "محصولات آفتاب",
        "رنگ مو",
        "شامپو",
      ];
      const electronicsKeywords = [
        "الکترونیک",
        "electronics",
        "موبایل",
        "mobile",
        "لپ تاپ",
        "laptop",
        "تبلت",
        "tablet",
        "هدفون",
        "headphone",
        "ساعت هوشمند",
        "smartwatch",
      ];
      const fashionKeywords = [
        "مد",
        "پوشاک",
        "fashion",
        "clothing",
        "dress",
        "shirt",
        "pants",
        "jeans",
        "skirt",
        "blouse",
        "t-shirt",
        "sweater",
        "jacket",
        "coat",
        "پیراهن",
        "تاپ",
        "شلوار",
        "شومیز",
        "دامن",
        "ژاکت",
        "کت",
        "کیف",
        "کیف دستی",
        "jewelry",
        "جواهرات",
        "زیورآلات",
      ];
      if (petsKeywords.some((k) => lowerQuery.includes(k))) queryType = "pets";
      else if (sportsKeywords.some((k) => lowerQuery.includes(k)))
        queryType = "sports";
      else if (vitaminKeywords.some((k) => lowerQuery.includes(k)))
        queryType = "vitamins";
      else if (beautyKeywords.some((k) => lowerQuery.includes(k))) {
        queryType = "beauty";
        isFashionQuery = true;
      } else if (electronicsKeywords.some((k) => lowerQuery.includes(k)))
        queryType = "electronics";
      else if (fashionKeywords.some((k) => lowerQuery.includes(k))) {
        queryType = "fashion";
        isFashionQuery = true;
      }
      if (queryType === "sports") {
        if (lowerQuery.includes("لوازم ورزشی") || lowerQuery.includes("ورزشی"))
          enhancedQuery += " spor malzemeleri fitness gym";
        if (lowerQuery.includes("کفش ورزشی"))
          enhancedQuery += " spor ayakkabı sneaker athletic shoes";
        if (lowerQuery.includes("لباس ورزشی"))
          enhancedQuery += " spor giyim atletik kıyafet sportswear";
        if (lowerQuery.includes("ساک ورزشی"))
          enhancedQuery += " spor çantası gym bag";
        if (lowerQuery.includes("ترموس ورزشی"))
          enhancedQuery += " spor termos water bottle";
      } else if (queryType === "pets") {
        if (lowerQuery.includes("غذای سگ"))
          enhancedQuery += " köpek maması dog food";
        if (lowerQuery.includes("غذای گربه"))
          enhancedQuery += " kedi maması cat food";
        if (lowerQuery.includes("قلاده"))
          enhancedQuery += " köpek tasması pet collar";
      } else if (queryType === "fashion") {
        if (lowerQuery.includes("پیراهن")) enhancedQuery += " gömlek shirt";
        if (lowerQuery.includes("کیف")) enhancedQuery += " çanta bag handbag";
        if (lowerQuery.includes("جین")) enhancedQuery += " jean denim";
      }
      const resultCount = isFashionQuery ? 60 : 50;
      const serpApiParams = {
        engine: "google_shopping",
        q: enhancedQuery,
        gl: "tr",
        hl: "tr",
        location: "Turkey",
        num: resultCount,
        device: "desktop",
        api_key: process.env.SERPAPI_KEY,
      } as const;
      let shoppingResults;
      let retryCount = 0;
      const maxRetries = 2;
      while (retryCount <= maxRetries) {
        try {
          shoppingResults = await getJson(serpApiParams);
          break;
        } catch (err) {
          retryCount++;
          if (retryCount > maxRetries) throw err;
          await new Promise((r) => setTimeout(r, 1000 * retryCount));
        }
      }
      if (
        !shoppingResults?.shopping_results ||
        shoppingResults.shopping_results.length === 0
      ) {
        return {
          products: [],
          message: "هیچ محصولی یافت نشد. لطفاً کلمات کلیدی دیگری امتحان کنید.",
          search_query: originalQuery,
          enhanced_query: enhancedQuery,
        };
      }
      const limitedResults =
        shoppingResults.shopping_results.slice(0, resultCount) || [];
      const translatedProductsPromises = limitedResults.map(
        async (product: any) => {
          try {
            const { title: persianTitle, description: persianDescription } =
              await translateTurkishToPersianKeepBrands(
                product.title,
                product.snippet || ""
              );
            let finalPrice = 0;
            let finalOriginalPrice: number | null = null;
            let currency = "TRY";
            if (product.extracted_price) finalPrice = product.extracted_price;
            else if (product.price) {
              const priceStr =
                typeof product.price === "string"
                  ? product.price
                  : product.price.toString();
              finalPrice =
                parseFloat(
                  priceStr.replace(/[^\d.,]/g, "").replace(",", ".")
                ) || 0;
            }
            if (product.original_price) {
              const originalPriceStr =
                typeof product.original_price === "string"
                  ? product.original_price
                  : product.original_price.toString();
              finalOriginalPrice =
                parseFloat(
                  originalPriceStr.replace(/[^\d.,]/g, "").replace(",", ".")
                ) || null;
            }
            if (product.currency) currency = product.currency;
            else if (product.price && typeof product.price === "string") {
              if (product.price.includes("₺")) currency = "TRY";
              else if (product.price.includes("€")) currency = "EUR";
              else if (product.price.includes("$")) currency = "USD";
            }
            const storeLink = extractProductLink(product);
            if (!storeLink) return null;
            const productData = {
              id:
                product.product_id ||
                `general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: product.title,
              title_fa: persianTitle,
              price: finalPrice.toString(),
              link: storeLink,
              thumbnail: product.thumbnail || product.image,
              source: product.source || "فروشگاه آنلاین",
              category: normalizedKey,
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            };
            try {
              const saved = new GoogleShoppingProduct(productData);
              await saved.save();
            } catch {}
            return {
              id: product.product_id || Math.random().toString(36).substr(2, 9),
              title: persianTitle,
              originalTitle: product.title,
              price: finalPrice,
              originalPrice: finalOriginalPrice,
              currency,
              image: product.thumbnail,
              description: persianDescription,
              originalDescription: product.snippet,
              link: storeLink,
              source: product.source || "فروشگاه آنلاین",
              rating: product.rating || 0,
              reviews: product.reviews || 0,
              delivery: product.delivery || "اطلاعات ارسال نامشخص",
              position: product.position,
              product_id: product.product_id,
            };
          } catch {
            return null;
          }
        }
      );
      const enhancedProducts = (
        await Promise.all(translatedProductsPromises)
      ).filter(Boolean) as any[];
      if (enhancedProducts.length > 0) {
        try {
          await GoogleShoppingProduct.limitProductsPerCategory(
            normalizedKey,
            60
          );
        } catch {}
      }
      return {
        products: enhancedProducts,
        total: shoppingResults.search_information?.total_results || 0,
        search_query: originalQuery,
        enhanced_query: enhancedQuery,
        query_type: queryType,
        cached: false,
      };
    };

    // If force refresh is requested, bypass caches
    if (force) {
      const fresh = await fetchProductsFromSerpApi(normalized, query);
      try {
        const redisKey = getRedisKeyForQuery(normalized);
        await redisSet(redisKey, fresh, { ex: ONE_HOUR_SECONDS });
      } catch {}
      return NextResponse.json(fresh);
    }

    // Otherwise, use reusable caching flow with normalized keys
    const responseData = await getProducts(query, fetchProductsFromSerpApi);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Shopping API Error:", error);

    // Provide more specific error messages based on error type
    let errorMessage = "خطا در جستجوی محصولات. لطفاً دوباره تلاش کنید.";
    let statusCode = 500;

    if (error instanceof Error) {
      if (
        error.message.includes("SERPAPI_KEY") ||
        error.message.includes("API key")
      ) {
        errorMessage = "خطا در تنظیمات API. لطفاً با پشتیبانی تماس بگیرید.";
        statusCode = 500;
      } else if (
        error.message.includes("MONGODB_URI") ||
        error.message.includes("database")
      ) {
        errorMessage = "خطا در اتصال به پایگاه داده. لطفاً دوباره تلاش کنید.";
        statusCode = 500;
      } else if (
        error.message.includes("timeout") ||
        error.message.includes("network")
      ) {
        errorMessage = "زمان انتظار به پایان رسید. لطفاً دوباره تلاش کنید.";
        statusCode = 408;
      } else if (
        error.message.includes("rate limit") ||
        error.message.includes("quota")
      ) {
        errorMessage = "محدودیت استفاده از API. لطفاً بعداً تلاش کنید.";
        statusCode = 429;
      } else {
        errorMessage = error.message;
        statusCode = 500;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
