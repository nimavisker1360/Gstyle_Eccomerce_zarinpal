import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";

const TURKISH_PETS_SITES = [
  "hepsiburada.com",
  "trendyol.com",
  "n11.com",
  "gittigidiyor.com",
  "amazon.com.tr",
  "petshop.com.tr",
  "patipet.com",
  "petyaşam.com",
  "beyazpati.com",
  "dostum.net",
  "petburada.com",
  "happydog.com.tr",
  "royalcanin.com.tr",
  "pedigreepet.com.tr",
  "whiskas.com.tr",
];

function filterTurkishPetsProducts(products: any[]): any[] {
  return products.filter((product) => {
    const productLink =
      product.link || product.source_link || product.merchant?.link || "";
    const isFromTurkishSite = TURKISH_PETS_SITES.some((site) =>
      productLink.toLowerCase().includes(site)
    );

    const title = (product.title || "").toLowerCase();
    const description = (product.snippet || "").toLowerCase();
    const combined = title + " " + description;

    const petsKeywords = [
      "pet",
      "hayvan",
      "köpek",
      "dog",
      "kedi",
      "cat",
      "mama",
      "food",
      "yem",
      "oyuncak",
      "toy",
      "tasma",
      "collar",
      "gezdirme",
      "leash",
      "yatak",
      "bed",
      "kap",
      "bowl",
      "kafes",
      "cage",
      "akvaryum",
      "aquarium",
      "balık",
      "fish",
      "kuş",
      "bird",
      "hamster",
      "tavşan",
      "rabbit",
      "bakım",
      "care",
      "şampuan",
      "vitamin",
      "ilaç",
      "medicine",
      "veteriner",
      "vet",
      "tımar",
      "grooming",
    ];

    const hasPetsKeywords = petsKeywords.some((keyword) =>
      combined.includes(keyword)
    );

    return isFromTurkishSite && hasPetsKeywords;
  });
}

async function translatePersianToTurkish(
  persianQuery: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return persianQuery;

  try {
    const translationPrompt = `
      ترجمه فارسی به ترکی برای محصولات حیوانات خانگی: "${persianQuery}"
      
      مثال: "غذای سگ" → "köpek maması"
      فقط ترجمه برگردان:
    `;

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: translationPrompt,
      maxOutputTokens: 100,
      temperature: 0.3,
    });

    return text.trim() || persianQuery;
  } catch (error) {
    return persianQuery;
  }
}

async function enhanceTurkishPetsQuery(
  turkishQuery: string
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) return [turkishQuery];

  try {
    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: `بهبود کوئری حیوانات خانگی: "${turkishQuery}" - 3 کوئری مختلف بساز:`,
      maxOutputTokens: 150,
      temperature: 0.7,
    });

    const queries = text
      .trim()
      .split("\n")
      .filter((q) => q.trim().length > 0);
    return queries.length > 0 ? queries : [turkishQuery];
  } catch (error) {
    return [turkishQuery];
  }
}

async function translateTurkishToPersian(
  title: string,
  description: string
): Promise<{ title: string; description: string }> {
  if (!process.env.OPENAI_API_KEY) return { title, description };

  try {
    const { text: response } = await generateText({
      model: openai("gpt-4"),
      prompt: `ترجمه محصول حیوانات خانگی از ترکی به فارسی:
      عنوان: ${title}
      JSON: {"title": "...", "description": "..."}`,
      maxOutputTokens: 200,
      temperature: 0.5,
    });

    try {
      const parsed = JSON.parse(response);
      return {
        title: parsed.title || title,
        description: parsed.description || description,
      };
    } catch {
      return { title, description };
    }
  } catch (error) {
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

    console.log(`🐕 Starting intelligent pets search for: "${query}"`);

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

    // Pets-specific random variations
    const petsVariations = [
      "kaliteli",
      "premium",
      "organik",
      "doğal",
      "özel",
      "profesyonel",
      "lüks",
      "trend",
      "popüler",
      "güvenli",
    ];
    const randomWord =
      petsVariations[Math.floor(Math.random() * petsVariations.length)];

    if (Math.random() > 0.4) {
      // 60% chance
      cleanQuery = `${cleanQuery} ${randomWord}`;
      console.log(`🎲 Added pets variation: "${randomWord}"`);
    }

    // Step 1: Translate Persian to Turkish
    console.log("🔄 Step 1: Translating Persian to Turkish...");
    const turkishQuery = await translatePersianToTurkish(cleanQuery);
    console.log(`✅ Persian to Turkish: "${query}" → "${turkishQuery}"`);

    // Step 2: Enhance Turkish query
    console.log("🔄 Step 2: Enhancing Turkish query for pets search...");
    const enhancedQueries = await enhanceTurkishPetsQuery(turkishQuery);
    console.log(`✅ Enhanced queries:`, enhancedQueries);

    // Step 3: Search Turkish pets sites
    console.log("🔄 Step 3: Searching Turkish pets sites...");
    let allProducts: any[] = [];

    for (const enhancedQuery of enhancedQueries.slice(0, 3)) {
      try {
        const serpApiParams = {
          engine: "google_shopping",
          q:
            enhancedQuery +
            " site:hepsiburada.com OR site:trendyol.com OR site:petlebi.com OR site:petzzshop.com",
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
          const filteredProducts = filterTurkishPetsProducts(
            searchResults.shopping_results
          );
          console.log(
            `✅ Found ${filteredProducts.length} Turkish pets products for query: "${enhancedQuery}"`
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
      `📊 Total unique pets products found: ${uniqueProducts.length}`
    );

    if (uniqueProducts.length === 0) {
      return NextResponse.json({
        products: [],
        message:
          "هیچ محصول حیوانات خانگی از سایت‌های معتبر ترکی یافت نشد. لطفاً کلمات کلیدی دیگری امتحان کنید.",
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
              `pets_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: product.title,
            title_fa: persianTitle,
            price: finalPrice.toString(),
            link: storeLink,
            thumbnail: product.thumbnail || product.image,
            source: product.source || "فروشگاه ترکی",
            category: "pets",
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
            category: "حیوانات خانگی",
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

    console.log(`✅ Final pets products ready: ${finalProducts.length}`);

    return NextResponse.json({
      products: finalProducts,
      total: finalProducts.length,
      search_query: query,
      turkish_query: turkishQuery,
      enhanced_queries: enhancedQueries,
      message: `${finalProducts.length} محصول حیوانات خانگی از سایت‌های معتبر ترکی یافت شد.`,
      turkish_sites_searched: TURKISH_PETS_SITES.slice(0, 10),
    });
  } catch (error) {
    console.error("❌ Intelligent Pets Search API Error:", error);
    return NextResponse.json(
      {
        error: "خطا در جستجوی هوشمند حیوانات خانگی. لطفاً دوباره تلاش کنید.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
