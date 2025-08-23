import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

// معتبرترین سایت‌های ترکی برای الکترونیک
const TURKISH_ELECTRONICS_SITES = [
  "hepsiburada.com",
  "trendyol.com",
  "n11.com",
  "gittigidiyor.com",
  "amazon.com.tr",
  "teknosa.com",
  "vatan.com",
  "mediamarkt.com.tr",
  "bimeks.com.tr",
  "elektrix.com",
  "incehesap.com",
  "epey.com",
  "akakce.com",
  "cimri.com",
  "apple.com.tr",
  "samsung.com.tr",
  "lg.com.tr",
  "arcelik.com.tr",
  "vestel.com.tr",
  "philips.com.tr",
];

function filterTurkishElectronicsProducts(products: any[]): any[] {
  return products.filter((product) => {
    const productLink =
      product.link || product.source_link || product.merchant?.link || "";
    const isFromTurkishSite = TURKISH_ELECTRONICS_SITES.some((site) =>
      productLink.toLowerCase().includes(site)
    );

    const title = (product.title || "").toLowerCase();
    const description = (product.snippet || "").toLowerCase();
    const combined = title + " " + description;

    // Filter out women's underwear products
    const underwearKeywords = [
      // Persian
      "کولوت",
      "پوشاک زیر",
      "لینجری",
      // English
      "panties",
      "underwear",
      "lingerie",
      "slip",
      "thong",
      "g-string",
      "briefs",
      "bikini",
      "swimwear",
      // Turkish
      "külot",
      "pamuklu",
      "iç çamaşırı",
      "mayo",
      "bikini",
      "plaj giyim",
      "gece elbisesi",
      "gece kıyafeti",
    ];

    // Check if product contains underwear keywords - if yes, exclude it
    if (underwearKeywords.some((keyword) => combined.includes(keyword))) {
      return false;
    }

    const electronicsKeywords = [
      "elektronik",
      "electronics",
      "telefon",
      "phone",
      "mobil",
      "mobile",
      "laptop",
      "bilgisayar",
      "computer",
      "tablet",
      "ipad",
      "monitor",
      "ekran",
      "screen",
      "kulaklık",
      "headphone",
      "hoparlör",
      "speaker",
      "kamera",
      "camera",
      "oyun",
      "gaming",
      "konsol",
      "console",
      "playstation",
      "xbox",
      "nintendo",
      "televizyon",
      "tv",
      "akıllı saat",
      "smartwatch",
      "fitbit",
      "apple watch",
      "şarj",
      "charger",
      "kablo",
      "cable",
      "powerbank",
      "bluetooth",
      "wifi",
      "drone",
      "robot",
      "teknik",
      "technical",
      "dijital",
      "digital",
    ];

    const hasElectronicsKeywords = electronicsKeywords.some((keyword) =>
      combined.includes(keyword)
    );

    return isFromTurkishSite && hasElectronicsKeywords;
  });
}

async function translatePersianToTurkish(
  persianQuery: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return persianQuery;
  }

  try {
    const translationPrompt = `
      شما یک مترجم متخصص در حوزه الکترونیک هستید. کوئری زیر را از فارسی به ترکی ترجمه کنید:

      کوئری فارسی: "${persianQuery}"

      راهنمایی‌ها:
      1. اگر نام برند (اپل، سامسونگ، ال جی و...) باشد، همان را نگه دارید
      2. اصطلاحات فنی الکترونیک دقیق ترکی استفاده کنید
      3. کلمات کلیدی مناسب برای جستجو در سایت‌های ترکی اضافه کنید

      مثال‌ها:
      - "موبایل سامسونگ" → "Samsung telefon"
      - "لپ تاپ ایسوس" → "Asus laptop"
      - "هدفون بلوتوث" → "bluetooth kulaklık"
      - "ساعت هوشمند" → "akıllı saat"

      فقط ترجمه ترکی را برگردانید:
    `;

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: translationPrompt,
      maxOutputTokens: 100,
      temperature: 0.3,
    });

    return text.trim() || persianQuery;
  } catch (error) {
    console.error("❌ Translation error:", error);
    return persianQuery;
  }
}

async function enhanceTurkishElectronicsQuery(
  turkishQuery: string
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [turkishQuery];
  }

  try {
    const enhancementPrompt = `
      کوئری الکترونیک ترکی زیر را بهبود دهید: "${turkishQuery}"

      3 تا 5 کوئری مختلف ایجاد کنید برای سایت‌های ترکی مثل Hepsiburada، Teknosa، Vatan:
    `;

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: enhancementPrompt,
      maxOutputTokens: 200,
      temperature: 0.7,
    });

    const queries = text
      .trim()
      .split("\n")
      .filter((q) => q.trim().length > 0);
    return queries.length > 0 ? queries : [turkishQuery];
  } catch (error) {
    console.error("❌ Query enhancement error:", error);
    return [turkishQuery];
  }
}

async function translateTurkishToPersian(
  title: string,
  description: string
): Promise<{ title: string; description: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { title, description };
  }

  try {
    const translationPrompt = `
      محصول الکترونیک زیر را از ترکی به فارسی ترجمه کنید:

      عنوان: ${title}
      توضیحات: ${description}

      پاسخ JSON:
      {
        "title": "عنوان فارسی",
        "description": "توضیحات فارسی (حداکثر 100 کلمه)"
      }
    `;

    const { text: response } = await generateText({
      model: openai("gpt-4"),
      prompt: translationPrompt,
      maxOutputTokens: 250,
      temperature: 0.5,
    });

    try {
      const parsed = JSON.parse(response);
      return {
        title: parsed.title || title,
        description: parsed.description || description,
      };
    } catch (parseError) {
      return { title, description };
    }
  } catch (error) {
    console.error("❌ Translation error:", error);
    return { title, description };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    console.log(`📱 Starting intelligent electronics search for: "${query}"`);

    if (!process.env.SERPAPI_KEY) {
      return NextResponse.json(
        { error: "Search service is not configured" },
        { status: 500 }
      );
    }

    // Connect to database
    await connectToDatabase();

    const turkishQuery = await translatePersianToTurkish(query);
    console.log(`✅ Persian to Turkish: "${query}" → "${turkishQuery}"`);

    const enhancedQueries = await enhanceTurkishElectronicsQuery(turkishQuery);
    console.log(`✅ Enhanced queries:`, enhancedQueries);

    let allProducts: any[] = [];

    for (const enhancedQuery of enhancedQueries.slice(0, 3)) {
      try {
        const serpApiParams = {
          engine: "google_shopping",
          q:
            enhancedQuery +
            " site:hepsiburada.com OR site:teknosa.com OR site:vatan.com OR site:trendyol.com",
          gl: "tr",
          hl: "tr",
          location: "Turkey",
          num: 40,
          device: "desktop",
          api_key: process.env.SERPAPI_KEY,
        };

        const searchResults = await getJson(serpApiParams);

        if (
          searchResults.shopping_results &&
          searchResults.shopping_results.length > 0
        ) {
          const filteredProducts = filterTurkishElectronicsProducts(
            searchResults.shopping_results
          );
          console.log(
            `✅ Found ${filteredProducts.length} Turkish electronics products`
          );
          allProducts.push(...filteredProducts);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Search error:`, error);
      }
    }

    // Remove duplicates
    const uniqueProducts = allProducts.filter(
      (product, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            (p.product_id && p.product_id === product.product_id) ||
            p.title === product.title
        )
    );

    console.log(
      `📊 Total unique electronics products found: ${uniqueProducts.length}`
    );

    if (uniqueProducts.length === 0) {
      return NextResponse.json({
        products: [],
        message:
          "هیچ محصول الکترونیک از سایت‌های معتبر ترکی یافت نشد. لطفاً کلمات کلیدی دیگری امتحان کنید.",
        search_query: query,
        turkish_query: turkishQuery,
        enhanced_queries: enhancedQueries,
      });
    }

    // Step 4: Translate products to Persian and save to database
    console.log(
      "🔄 Step 4: Translating products to Persian and saving to database..."
    );
    const translatedProductsPromises = uniqueProducts.map(
      async (product, index) => {
        try {
          console.log(`🔄 Translating product ${index + 1}: ${product.title}`);

          const { title: persianTitle, description: persianDescription } =
            await translateTurkishToPersian(
              product.title,
              product.snippet || ""
            );

          let finalPrice = 0;
          let finalOriginalPrice = null;
          let currency = "TRY";

          if (product.extracted_price) {
            finalPrice = product.extracted_price;
          } else if (product.price) {
            const priceStr =
              typeof product.price === "string"
                ? product.price
                : product.price.toString();
            finalPrice =
              parseFloat(priceStr.replace(/[^\d.,]/g, "").replace(",", ".")) ||
              0;
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

          if (product.currency) {
            currency = product.currency;
          } else if (product.price && typeof product.price === "string") {
            if (product.price.includes("₺")) currency = "TRY";
            else if (product.price.includes("€")) currency = "EUR";
            else if (product.price.includes("$")) currency = "USD";
          }

          const storeLink =
            product.link || product.source_link || product.merchant?.link || "";

          let googleShoppingLink = "";
          if (product.product_id) {
            googleShoppingLink = `https://www.google.com.tr/shopping/product/${product.product_id}?gl=tr`;
          } else if (product.product_link) {
            googleShoppingLink = product.product_link;
          } else {
            googleShoppingLink = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(product.title)}`;
          }

          console.log(`✅ Successfully translated: ${persianTitle}`);

          // Create product data for database
          const productData = {
            id:
              product.product_id ||
              `electronics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: product.title,
            title_fa: persianTitle,
            price: finalPrice.toString(),
            link: storeLink,
            thumbnail: product.thumbnail || product.image,
            source: product.source || "فروشگاه ترکی",
            category: "electronics",
            createdAt: new Date(),
          };

          // Save to MongoDB
          try {
            const savedProduct = new GoogleShoppingProduct(productData);
            await savedProduct.save();
            console.log(`💾 Saved to database: ${persianTitle}`);
          } catch (dbError) {
            console.error(
              `❌ Database save error for ${persianTitle}:`,
              dbError
            );
            // Continue even if database save fails
          }

          return {
            id: product.product_id || Math.random().toString(36).substr(2, 9),
            title: persianTitle,
            originalTitle: product.title,
            price: finalPrice,
            originalPrice: finalOriginalPrice,
            currency: currency,
            image: product.thumbnail,
            description: persianDescription,
            originalDescription: product.snippet || "",
            link: storeLink,
            googleShoppingLink: googleShoppingLink,
            source: product.source || "فروشگاه ترکی",
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            delivery: "ارسال از ترکیه",
            category: "الکترونیک",
            turkishKeywords: enhancedQueries,
          };
        } catch (error) {
          console.error(`❌ Error translating product ${index + 1}:`, error);
          return null;
        }
      }
    );

    const finalProducts = (
      await Promise.all(translatedProductsPromises)
    ).filter(Boolean);

    console.log(`✅ Final electronics products ready: ${finalProducts.length}`);

    return NextResponse.json({
      products: finalProducts,
      total: finalProducts.length,
      search_query: query,
      turkish_query: turkishQuery,
      enhanced_queries: enhancedQueries,
      message: `${finalProducts.length} محصول الکترونیک از سایت‌های معتبر ترکی یافت شد.`,
      turkish_sites_searched: TURKISH_ELECTRONICS_SITES.slice(0, 10),
    });
  } catch (error) {
    console.error("❌ Intelligent Electronics Search API Error:", error);
    return NextResponse.json(
      {
        error: "خطا در جستجوی هوشمند الکترونیک. لطفاً دوباره تلاش کنید.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
