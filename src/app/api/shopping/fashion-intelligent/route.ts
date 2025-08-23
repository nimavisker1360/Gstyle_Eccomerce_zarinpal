import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

// معتبرترین سایت‌های ترکی برای مد و پوشاک
const TURKISH_FASHION_SITES = [
  "hepsiburada.com",
  "trendyol.com",
  "n11.com",
  "gittigidiyor.com",
  "amazon.com.tr",
  "zara.com.tr",
  "hm.com.tr",
  "mango.com.tr",
  "koton.com.tr",
  "lcwaikiki.com",
  "defacto.com.tr",
  "colin.com.tr",
  "boyner.com.tr",
  "beymen.com",
  "machka.com.tr",
  "ipekyol.com.tr",
  "network.com.tr",
  "vakko.com",
  "kinetix.com.tr",
  "flo.com.tr",
];

type GenderIntent = "men" | "kids" | null;
type SubcategoryIntent =
  | "jeans"
  | "pants"
  | "shirt"
  | "tshirt"
  | "shoes"
  | "jacket"
  | "coat"
  | "sweater"
  | null;

interface FashionIntent {
  gender: GenderIntent;
  subcategory: SubcategoryIntent;
}

function detectFashionIntent(persianQuery: string): FashionIntent {
  const q = persianQuery.toLowerCase();
  let gender: GenderIntent = null;
  if (/(مردانه|آقایان|اقایان|مرد|پسرانه)/.test(q)) gender = "men";
  else if (/(بچه|کودک|نوزاد|پسرانه|دخترانه|کودکان)/.test(q)) gender = "kids";

  let subcategory: SubcategoryIntent = null;
  if (/(شلوار\s*جین|جین|لی)/.test(q)) subcategory = "jeans";
  else if (/شلوار/.test(q)) subcategory = "pants";
  else if (/(تی\s*شرت|تیشرت|تی-شرت)/.test(q)) subcategory = "tshirt";
  else if (/پیراهن/.test(q)) subcategory = "shirt";
  else if (/(کفش|اسنیکرز|صندل|بوت)/.test(q)) subcategory = "shoes";
  else if (/(کاپشن|ژاکت|کت)/.test(q)) subcategory = "jacket";
  else if (/پالتو/.test(q)) subcategory = "coat";
  else if (/(سویشرت|ژاکت\s*بافت|بافت|پلوور|سوئیشرت)/.test(q))
    subcategory = "sweater";

  return { gender, subcategory };
}

function buildEnhancedQueriesFromIntent(
  baseTurkishQuery: string,
  intent: FashionIntent
): string[] {
  const queries: string[] = [];

  const genderMap: Record<Exclude<GenderIntent, null>, string[]> = {
    men: ["erkek"],
    kids: ["çocuk", "bebek"],
  };

  const subcategoryMap: Record<Exclude<SubcategoryIntent, null>, string[]> = {
    jeans: ["jean", "kot", "denim", "pantolon"],
    pants: ["pantolon"],
    shirt: ["gömlek"],
    tshirt: ["tişört", "t-shirt"],
    shoes: ["ayakkabı", "sneaker", "spor ayakkabı", "bot"],
    jacket: ["ceket", "mont"],
    coat: ["mont", "kaban"],
    sweater: ["kazak", "sweatshirt", "hırka"],
  };

  const genderWords = intent.gender ? genderMap[intent.gender] : [];
  const subcatWords = intent.subcategory
    ? subcategoryMap[intent.subcategory]
    : [];

  if (genderWords.length === 0 && subcatWords.length === 0) {
    return [baseTurkishQuery];
  }

  const combinations: string[] = [];
  const base = baseTurkishQuery.replace(/\s+/g, " ").trim();

  if (genderWords.length && subcatWords.length) {
    for (const g of genderWords) {
      for (const s of subcatWords) {
        combinations.push(`${g} ${s}`);
        combinations.push(`${s} ${g}`);
      }
    }
  } else if (genderWords.length) {
    for (const g of genderWords) combinations.push(g);
  } else if (subcatWords.length) {
    for (const s of subcatWords) combinations.push(s);
  }

  for (const c of combinations) {
    queries.push(`${base} ${c}`.trim());
  }

  // Add a couple of targeted variants for jeans intent
  if (intent.subcategory === "jeans") {
    if (intent.gender === "men") {
      queries.push("erkek kot pantolon");
      queries.push("erkek jean pantolon");
    }
  }

  // Ensure uniqueness
  return Array.from(new Set(queries)).slice(0, 5);
}

// Function to filter products from Turkish fashion sites with strict intent matching
function filterTurkishFashionProducts(
  products: any[],
  intent?: FashionIntent
): any[] {
  const genderRequired: Record<Exclude<GenderIntent, null>, string[]> = {
    men: ["erkek"],
    kids: ["çocuk", "bebek"],
  };

  const genderExclude: Record<Exclude<GenderIntent, null>, string[]> = {
    men: [],
    kids: [],
  };

  const subcatRequired: Record<Exclude<SubcategoryIntent, null>, string[]> = {
    jeans: ["jean", "kot", "denim", "pantolon"],
    pants: ["pantolon"],
    shirt: ["gömlek"],
    tshirt: ["tişört", "t-shirt"],
    shoes: ["ayakkabı", "sneaker", "spor ayakkabı", "bot"],
    jacket: ["ceket", "mont"],
    coat: ["kaban", "mont"],
    sweater: ["kazak", "sweatshirt", "hırka"],
  };

  return products.filter((product) => {
    const productLink =
      product.link || product.source_link || product.merchant?.link || "";
    const isFromTurkishSite = TURKISH_FASHION_SITES.some((site) =>
      productLink.toLowerCase().includes(site)
    );
    if (!isFromTurkishSite) return false;

    const title = (product.title || "").toLowerCase();
    const description = (product.snippet || "").toLowerCase();
    const combined = `${title} ${description}`;

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

    // If we have an intent, enforce it strictly
    if (intent) {
      if (intent.gender) {
        const must = genderRequired[intent.gender];
        const notAllowed = genderExclude[intent.gender];
        const hasGender = must.some((w) => combined.includes(w));
        const hasOpposite = notAllowed.some((w) => combined.includes(w));
        if (!hasGender || hasOpposite) return false;
      }
      if (intent.subcategory) {
        const must = subcatRequired[intent.subcategory];
        const hasSubcat = must.some((w) => combined.includes(w));
        if (!hasSubcat) return false;
      }
    } else {
      // Fallback broad fashion relevance
      const fashionKeywords = [
        "giyim",
        "clothing",
        "moda",
        "fashion",
        "gömlek",
        "shirt",
        "pantolon",
        "pants",
        "jean",
        "denim",
        "tişört",
        "t-shirt",
        "kazak",
        "sweater",
        "ceket",
        "jacket",
        "mont",
        "coat",
        "ayakkabı",
        "shoes",
        "bot",
        "boots",
        "spor ayakkabı",
        "sneakers",
        "çanta",
        "bag",
        "el çantası",
        "handbag",
        "aksesuar",
        "accessories",
        "takı",
        "jewelry",
      ];
      const hasFashionKeywords = fashionKeywords.some((keyword) =>
        combined.includes(keyword)
      );
      if (!hasFashionKeywords) return false;
    }

    return true;
  });
}

// Function to translate Persian to Turkish for fashion products
async function translatePersianToTurkish(
  persianQuery: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return persianQuery;
  }

  try {
    const translationPrompt = `
      شما یک مترجم متخصص در حوزه مد و پوشاک هستید. کوئری زیر را از فارسی به ترکی ترجمه کنید:

      کوئری فارسی: "${persianQuery}"

      راهنمایی‌ها:
      1. اگر نام برند (زارا، اچ اند ام، مانگو و...) باشد، همان را نگه دارید
      2. اصطلاحات مد و پوشاک دقیق ترکی استفاده کنید
      3. کلمات کلیدی مناسب برای جستجو در سایت‌های ترکی اضافه کنید
      4. اگر سایز یا رنگ ذکر شده، آن را دقیق ترجمه کنید

      مثال‌ها:
      - "کفش مردانه" → "erkek ayakkabı"
      - "کیف دستی" → "el çantası"
      - "پیراهن آبی" → "mavi gömlek"

      فقط ترجمه ترکی را برگردانید، بدون توضیح اضافی:
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

// Function to enhance Turkish query for better fashion search
async function enhanceTurkishFashionQuery(
  turkishQuery: string
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [turkishQuery];
  }

  try {
    const enhancementPrompt = `
      شما یک متخصص SEO برای فروشگاه‌های مد ترکی هستید. کوئری ترکی زیر را برای جستجوی بهتر در سایت‌های مد ترکی بهبود دهید:

      کوئری اصلی: "${turkishQuery}"

      لطفاً 3 تا 5 کوئری مختلف ایجاد کنید که:
      1. شامل کلمات کلیدی مختلف مد باشد
      2. برندهای مختلف را در نظر بگیرد
      3. برای سایت‌های ترکی مثل Trendyol، LC Waikiki، Zara بهینه باشد
      4. انواع محصولات مرتبط را شامل شود

      فقط کوئری‌ها را خط به خط برگردانید:
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

// Function to translate Turkish results back to Persian
async function translateTurkishToPersian(
  title: string,
  description: string
): Promise<{ title: string; description: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { title, description };
  }

  try {
    const translationPrompt = `
      محصول مد و پوشاک زیر را از ترکی به فارسی ترجمه کنید:

      عنوان: ${title}
      توضیحات: ${description}

      راهنمایی‌ها:
      1. نام برندها را دست نخورید (Zara, H&M, Mango, ...)
      2. اصطلاحات مد فارسی دقیق استفاده کنید
      3. ترجمه طبیعی و روان باشد
      4. برای فروش در ایران مناسب باشد

      پاسخ را در فرمت JSON برگردانید:
      {
        "title": "عنوان فارسی",
        "description": "توضیحات فارسی (جذاب و مناسب فروش، حداکثر 100 کلمه)"
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
      console.error("❌ JSON parse error:", parseError);
      return { title, description };
    }
  } catch (error) {
    console.error("❌ Turkish to Persian translation error:", error);
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

    console.log(`👗 Starting intelligent fashion search for: "${query}"`);

    if (!process.env.SERPAPI_KEY) {
      console.error("❌ SERPAPI_KEY is not configured");
      return NextResponse.json(
        { error: "Search service is not configured" },
        { status: 500 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Add randomization for diverse results
    let cleanQuery = query.replace(/\s+\d{13}$/, "").trim();

    // Fashion-specific random variations
    const fashionVariations = [
      "modaya uygun",
      "şık",
      "trend",
      "kaliteli",
      "özel",
      "modern",
      "popüler",
      "yeni sezon",
      "stil",
      "güzel",
    ];
    const randomWord =
      fashionVariations[Math.floor(Math.random() * fashionVariations.length)];

    if (Math.random() > 0.4) {
      // 60% chance
      cleanQuery = `${cleanQuery} ${randomWord}`;
      console.log(`🎲 Added fashion variation: "${randomWord}"`);
    }

    // Detect intent (gender/subcategory) from Persian query
    const intent = detectFashionIntent(cleanQuery);

    // Step 1: Translate Persian to Turkish
    console.log("🔄 Step 1: Translating Persian to Turkish...");
    const turkishQuery = await translatePersianToTurkish(cleanQuery);
    console.log(`✅ Persian to Turkish: "${query}" → "${turkishQuery}"`);

    // Step 2: Enhance Turkish query (intent-aware when possible)
    console.log("🔄 Step 2: Enhancing Turkish query for fashion search...");
    let enhancedQueries: string[] = [];
    if (intent.gender || intent.subcategory) {
      enhancedQueries = buildEnhancedQueriesFromIntent(turkishQuery, intent);
    } else {
      enhancedQueries = await enhanceTurkishFashionQuery(turkishQuery);
    }
    console.log(`✅ Enhanced queries:`, enhancedQueries);

    // Step 3: Search Turkish fashion sites
    console.log("🔄 Step 3: Searching Turkish fashion sites...");
    let allProducts: any[] = [];

    for (const enhancedQuery of enhancedQueries.slice(0, 3)) {
      try {
        const serpApiParams = {
          engine: "google_shopping",
          q:
            enhancedQuery +
            " site:trendyol.com OR site:hepsiburada.com OR site:lcwaikiki.com OR site:zara.com.tr OR site:hm.com.tr",
          gl: "tr",
          hl: "tr",
          location: "Turkey",
          num: 50,
          device: "desktop",
          api_key: process.env.SERPAPI_KEY,
        };

        console.log(`🔍 Searching with: "${enhancedQuery}"`);
        const searchResults = await getJson(serpApiParams);

        if (
          searchResults.shopping_results &&
          searchResults.shopping_results.length > 0
        ) {
          const filteredProducts = filterTurkishFashionProducts(
            searchResults.shopping_results,
            intent
          );
          console.log(
            `✅ Found ${filteredProducts.length} Turkish fashion products for query: "${enhancedQuery}"`
          );
          allProducts.push(...filteredProducts);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Search error for query "${enhancedQuery}":`, error);
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
      `📊 Total unique fashion products found: ${uniqueProducts.length}`
    );

    if (uniqueProducts.length === 0) {
      return NextResponse.json({
        products: [],
        message:
          "هیچ محصول مد و پوشاک از سایت‌های معتبر ترکی یافت نشد. لطفاً کلمات کلیدی دیگری امتحان کنید.",
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
              `fashion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: product.title,
            title_fa: persianTitle,
            price: finalPrice.toString(),
            link: storeLink,
            thumbnail: product.thumbnail || product.image,
            source: product.source || "فروشگاه ترکی",
            category: "fashion",
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
            category: "مد و پوشاک",
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

    console.log(`✅ Final fashion products ready: ${finalProducts.length}`);

    return NextResponse.json({
      products: finalProducts,
      total: finalProducts.length,
      search_query: query,
      turkish_query: turkishQuery,
      enhanced_queries: enhancedQueries,
      message: `${finalProducts.length} محصول مد و پوشاک از سایت‌های معتبر ترکی یافت شد.`,
      turkish_sites_searched: TURKISH_FASHION_SITES.slice(0, 10),
    });
  } catch (error) {
    console.error("❌ Intelligent Fashion Search API Error:", error);
    return NextResponse.json(
      {
        error: "خطا در جستجوی هوشمند مد و پوشاک. لطفاً دوباره تلاش کنید.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
