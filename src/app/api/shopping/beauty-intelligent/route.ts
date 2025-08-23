import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

// معتبرترین سایت‌های ترکی برای زیبایی و آرایش
const TURKISH_BEAUTY_SITES = [
  "hepsiburada.com",
  "trendyol.com",
  "n11.com",
  "gittigidiyor.com",
  "amazon.com.tr",
  "sephora.com.tr",
  "douglas.com.tr",
  "gratis.com",
  "flormar.com.tr",
  "goldenrose.com.tr",
  "farmasi.com.tr",
  "rossman.com.tr",
  "watsons.com.tr",
  "avon.com.tr",
  "oriflame.com.tr",
  "yves-rocher.com.tr",
  "lorealparis.com.tr",
  "maybelline.com.tr",
  "clinique.com.tr",
  "esteelauder.com.tr",
];

// Function to filter products from Turkish beauty sites
function filterTurkishBeautyProducts(products: any[]): any[] {
  return products.filter((product) => {
    const productLink =
      product.link || product.source_link || product.merchant?.link || "";
    const isFromTurkishSite = TURKISH_BEAUTY_SITES.some((site) =>
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

    const beautyKeywords = [
      "kozmetik",
      "cosmetics",
      "güzellik",
      "beauty",
      "makyaj",
      "makeup",
      "parfüm",
      "perfume",
      "ruj",
      "lipstick",
      "fondöten",
      "foundation",
      "maskara",
      "mascara",
      "göz kalemi",
      "eyeliner",
      "far",
      "eyeshadow",
      "allık",
      "blush",
      "pudra",
      "powder",
      "concealer",
      "kapatıcı",
      "cilt bakım",
      "skincare",
      "nemlendirici",
      "moisturizer",
      "temizleyici",
      "cleanser",
      "serum",
      "krem",
      "cream",
      "güneş kremi",
      "sunscreen",
      "şampuan",
      "shampoo",
      "saç bakım",
      "hair care",
      "saç boyası",
      "hair dye",
      "oje",
      "nail polish",
      "dudak balsamı",
      "lip balm",
      "makyaj fırçası",
      "makeup brush",
      "tırnak",
      "nail",
    ];

    const hasBeautyKeywords = beautyKeywords.some((keyword) =>
      combined.includes(keyword)
    );

    return isFromTurkishSite && hasBeautyKeywords;
  });
}

// Function to translate Persian to Turkish for beauty products
async function translatePersianToTurkish(
  persianQuery: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return persianQuery;
  }

  try {
    const translationPrompt = `
      شما یک مترجم متخصص در حوزه زیبایی و آرایش هستید. کوئری زیر را از فارسی به ترکی ترجمه کنید:

      کوئری فارسی: "${persianQuery}"

      راهنمایی‌ها:
      1. اگر نام برند (لورآل، میبلین، کلینیک و...) باشد، همان را نگه دارید
      2. اصطلاحات زیبایی و آرایش دقیق ترکی استفاده کنید
      3. کلمات کلیدی مناسب برای جستجو در سایت‌های ترکی اضافه کنید
      4. اگر رنگ یا نوع پوست ذکر شده، آن را دقیق ترجمه کنید

      مثال‌ها:
      - "رژ لب قرمز" → "kırmızı ruj"
      - "کرم آفتاب" → "güneş kremi"
      - "ماسکارا ضد آب" → "su geçirmez maskara"
      - "لوازم آرایش" → "makyaj malzemeleri"

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

// Function to enhance Turkish query for better beauty search
async function enhanceTurkishBeautyQuery(
  turkishQuery: string
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [turkishQuery];
  }

  try {
    const enhancementPrompt = `
      شما یک متخصص SEO برای فروشگاه‌های زیبایی ترکی هستید. کوئری ترکی زیر را برای جستجوی بهتر در سایت‌های زیبایی ترکی بهبود دهید:

      کوئری اصلی: "${turkishQuery}"

      لطفاً 3 تا 5 کوئری مختلف ایجاد کنید که:
      1. شامل کلمات کلیدی مختلف زیبایی باشد
      2. برندهای مختلف را در نظر بگیرد
      3. برای سایت‌های ترکی مثل Sephora، Gratis، Douglas بهینه باشد
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
      محصول زیبایی و آرایش زیر را از ترکی به فارسی ترجمه کنید:

      عنوان: ${title}
      توضیحات: ${description}

      راهنمایی‌ها:
      1. نام برندها را دست نخورید (L'Oreal, Maybelline, Clinique, ...)
      2. اصطلاحات زیبایی فارسی دقیق استفاده کنید
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

    console.log(`💄 Starting intelligent beauty search for: "${query}"`);

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

    // Beauty-specific random variations
    const beautyVariations = [
      "doğal",
      "organik",
      "kaliteli",
      "özel",
      "premium",
      "lüks",
      "trend",
      "popüler",
      "etkili",
      "güzel",
    ];
    const randomWord =
      beautyVariations[Math.floor(Math.random() * beautyVariations.length)];

    if (Math.random() > 0.4) {
      // 60% chance
      cleanQuery = `${cleanQuery} ${randomWord}`;
      console.log(`🎲 Added beauty variation: "${randomWord}"`);
    }

    // Step 1: Translate Persian to Turkish
    console.log("🔄 Step 1: Translating Persian to Turkish...");
    const turkishQuery = await translatePersianToTurkish(cleanQuery);
    console.log(`✅ Persian to Turkish: "${query}" → "${turkishQuery}"`);

    // Step 2: Enhance Turkish query
    console.log("🔄 Step 2: Enhancing Turkish query for beauty search...");
    const enhancedQueries = await enhanceTurkishBeautyQuery(turkishQuery);
    console.log(`✅ Enhanced queries:`, enhancedQueries);

    // Step 3: Search Turkish beauty sites
    console.log("🔄 Step 3: Searching Turkish beauty sites...");
    let allProducts: any[] = [];

    for (const enhancedQuery of enhancedQueries.slice(0, 3)) {
      try {
        const serpApiParams = {
          engine: "google_shopping",
          q:
            enhancedQuery +
            " site:sephora.com.tr OR site:hepsiburada.com OR site:trendyol.com OR site:glamour.com.tr",
          gl: "tr",
          hl: "tr",
          location: "Turkey",
          num: "50",
          device: "desktop",
          api_key: process.env.SERPAPI_KEY,
        };

        console.log(`🔍 Searching with query: "${enhancedQuery}"`);

        const response = await fetch(
          `https://serpapi.com/search?${new URLSearchParams(serpApiParams)}`
        );

        if (!response.ok) {
          console.error(
            `❌ SerpAPI error for query "${enhancedQuery}":`,
            response.status
          );
          continue;
        }

        const data = await response.json();
        const products = data.shopping_results || [];

        if (products.length > 0) {
          console.log(
            `✅ Found ${products.length} products for "${enhancedQuery}"`
          );
          allProducts.push(...products);
        } else {
          console.log(`⚠️ No products found for "${enhancedQuery}"`);
        }
      } catch (error) {
        console.error(`❌ Error searching for "${enhancedQuery}":`, error);
      }
    }

    // Step 4: Filter and process products
    console.log("🔄 Step 4: Filtering and processing products...");
    const filteredProducts = filterTurkishBeautyProducts(allProducts);
    console.log(
      `✅ Filtered to ${filteredProducts.length} Turkish beauty products`
    );

    // Step 5: Translate product details back to Persian
    console.log("🔄 Step 5: Translating product details to Persian...");
    const processedProducts = await Promise.all(
      filteredProducts.slice(0, 20).map(async (product) => {
        const translatedTitle = await translateTurkishToPersian(
          product.title || "",
          product.title || ""
        );
        const translatedDescription = await translateTurkishToPersian(
          product.snippet || "",
          product.snippet || ""
        );

        return {
          id: product.product_id || Math.random().toString(36).substr(2, 9),
          title: translatedTitle.title,
          description: translatedDescription.description,
          price: product.extracted_price || product.price || "قیمت نامشخص",
          currency: product.currency || "TL",
          rating: product.rating || null,
          reviews: product.reviews || null,
          image: product.thumbnail || product.image || "",
          link: product.link || product.source_link || "",
          source: product.source || "نامشخص",
          originalTitle: product.title || "",
          originalDescription: product.snippet || "",
        };
      })
    );

    console.log(
      `🎉 Beauty search completed successfully! Found ${processedProducts.length} products`
    );

    return NextResponse.json({
      success: true,
      products: processedProducts,
      total: processedProducts.length,
      query: query,
      message: "Beauty products found successfully",
    });
  } catch (error) {
    console.error("❌ Error in beauty intelligent search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
