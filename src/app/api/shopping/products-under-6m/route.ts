import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { connectToDatabase } from "@/lib/db";
import DiscountProduct from "@/lib/db/models/discount-product.model";
import { convertTRYToRial } from "@/lib/utils";

// Turkish search queries for products under 6 million Rials (excluding women's products)
const searchQueries = [
  // Men's fashion
  "erkek giyim indirim",
  "erkek ayakkabı indirim",
  "erkek çanta indirim",
  "erkek aksesuar indirim",
  "erkek spor giyim indirim",
  "erkek jean indirim",
  "erkek tişört indirim",
  "erkek gömlek indirim",
  "erkek mont indirim",
  "erkek ceket indirim",

  // Children's fashion
  "çocuk giyim indirim",
  "çocuk ayakkabı indirim",
  "çocuk oyuncak indirim",
  "çocuk spor malzemeleri indirim",

  // Electronics
  "telefon aksesuar indirim",
  "bilgisayar aksesuar indirim",
  "kulaklık indirim",
  "şarj cihazı indirim",
  "kılıf indirim",

  // Sports
  "spor malzemeleri indirim",
  "fitness ekipmanları indirim",
  "spor ayakkabı erkek indirim",
  "spor çanta indirim",

  // Home & Garden
  "ev aksesuar indirim",
  "bahçe malzemeleri indirim",
  "dekorasyon indirim",

  // Automotive
  "araç aksesuar indirim",
  "oto bakım ürünleri indirim",

  // Generic discount queries
  "büyük indirim",
  "kampanya ürünleri",
  "outlet fırsat",
  "ucuz ürünler",
  "ekonomik fiyat",
];

// Words to filter out (women's products)
const womenKeywords = [
  "kadın",
  "kız",
  "bayan",
  "kadınlar",
  "kızlar",
  "bayanlar",
  "kadın giyim",
  "kız giyim",
  "bayan giyim",
  "kadın ayakkabı",
  "kız ayakkabı",
  "bayan ayakkabı",
  "kadın çanta",
  "kız çanta",
  "bayan çanta",
  "kadın aksesuar",
  "kız aksesuar",
  "bayan aksesuar",
  "elbise",
  "bluz",
  "etek",
  "tayt",
  "legging",
  "kadın spor",
  "kız spor",
  "bayan spor",
  "kadın iç giyim",
  "kız iç giyim",
  "bayan iç giyim",
  "kadın mayo",
  "kız mayo",
  "bayan mayo",
  "kadın bikini",
  "kız bikini",
  "bayan bikini",
  "kadın makyaj",
  "kız makyaj",
  "bayan makyaj",
  "kadın parfüm",
  "kız parfüm",
  "bayan parfüm",
  "kadın kozmetik",
  "kız kozmetik",
  "bayan kozmetik",
];

interface ShoppingProduct {
  id: string;
  title: string;
  originalTitle?: string;
  price: number;
  originalPrice?: number | null;
  currency: string;
  image: string;
  description: string;
  originalDescription?: string;
  link?: string;
  googleShoppingLink?: string;
  source: string;
  rating: number;
  reviews: number;
  delivery: string;
  priceInRial: number;
}

// Cache for products under 6 million Rials
let productsCache: {
  data: ShoppingProduct[];
  timestamp: number;
  ttl: number;
} | null = null;

// Cache duration: 30 minutes
const CACHE_TTL = 30 * 60 * 1000;

// Maximum price in Rials (6 million)
const MAX_PRICE_RIAL = 6000000;

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Starting products under 6 million Rials fetch...");
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "true";

    // 1) Try DB first (unless forceRefresh)
    await connectToDatabase();
    if (!forceRefresh) {
      const dbProducts = await DiscountProduct.find({
        priceInRial: { $lt: MAX_PRICE_RIAL },
      })
        .sort({ createdAt: -1 })
        .limit(50) // Increased from 40 to 50 to ensure we have enough
        .lean();

      if (dbProducts && dbProducts.length >= 16) {
        // Changed from 40 to 16
        console.log(
          `✅ Returning ${dbProducts.length} products under 6M Rials from DB cache`
        );
        return NextResponse.json({
          products: dbProducts.slice(0, 50), // Return all found products
          total: dbProducts.length,
          message: `${dbProducts.length} محصول زیر ۶ میلیون ریال از کش دیتابیس یافت شد`,
          cached: true,
          source: "db",
        });
      }
    }

    // 2) Check in-memory cache
    const now = Date.now();
    if (
      !forceRefresh &&
      productsCache &&
      now - productsCache.timestamp < productsCache.ttl
    ) {
      console.log("✅ Returning cached products under 6M Rials");
      return NextResponse.json({
        products: productsCache.data,
        total: productsCache.data.length,
        message: `${productsCache.data.length} محصول زیر ۶ میلیون ریال از کش حافظه یافت شد`,
        cached: true,
        source: "memory",
      });
    }

    // 3) Check if API keys are available
    if (!process.env.SERPAPI_KEY) {
      console.error("❌ SERPAPI_KEY is not configured");
      return NextResponse.json(
        { error: "Search service is not configured" },
        { status: 500 }
      );
    }

    let allProducts: ShoppingProduct[] = [];

    // Shuffle queries for diverse results
    const shuffledQueries = [...searchQueries].sort(() => Math.random() - 0.5);

    // Use first 3 queries for better performance
    const selectedQueries = shuffledQueries.slice(0, 3);

    // Execute searches in parallel
    const searchPromises = selectedQueries.map(async (query, index) => {
      console.log(`🔍 Searching with query ${index + 1}: "${query}"`);

      try {
        const serpApiParams = {
          engine: "google_shopping",
          q: query,
          gl: "tr", // Turkey
          hl: "tr", // Turkish language
          location: "Turkey",
          num: 30, // More results per query to filter better
          device: "desktop",
          api_key: process.env.SERPAPI_KEY,
        };

        const shoppingResults = await getJson(serpApiParams);

        if (
          shoppingResults.shopping_results &&
          shoppingResults.shopping_results.length > 0
        ) {
          console.log(
            `✅ Found ${shoppingResults.shopping_results.length} products for query: "${query}"`
          );

          // Filter out women's products and process
          const filteredProducts = shoppingResults.shopping_results
            .filter((product: any) => {
              const title = (product.title || "").toLowerCase();
              const description = (product.snippet || "").toLowerCase();
              const combined = title + " " + description;

              // Check if product contains women's keywords
              const hasWomenKeywords = womenKeywords.some((keyword) =>
                combined.includes(keyword.toLowerCase())
              );

              return !hasWomenKeywords;
            })
            .map((product: any, productIndex: number) => {
              let currentPrice = Number.NaN;

              // Try numeric extracted price first
              if (
                typeof product.extracted_price === "number" &&
                Number.isFinite(product.extracted_price)
              ) {
                currentPrice = product.extracted_price;
              }

              // Fallback: parse from price string like "₺1,99"
              if (
                !Number.isFinite(currentPrice) &&
                product.price &&
                typeof product.price === "string"
              ) {
                const priceMatch = product.price.match(/[\d,.]+/);
                if (priceMatch) {
                  const normalized = priceMatch[0]
                    .replace(/\./g, "")
                    .replace(/,/g, ".");
                  const parsed = parseFloat(normalized);
                  if (Number.isFinite(parsed)) {
                    currentPrice = parsed;
                  }
                }
              }

              // Skip if price is invalid
              if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
                return null;
              }

              // Convert TRY to Rial
              const priceInRial = convertTRYToRial(currentPrice);

              // Skip if price is over 6 million Rials
              if (priceInRial > MAX_PRICE_RIAL) {
                return null;
              }

              // Build Google Shopping link
              let googleShoppingLink = "";
              if (product.product_id) {
                googleShoppingLink = `https://www.google.com.tr/shopping/product/${product.product_id}?gl=tr`;
              } else if (product.product_link) {
                googleShoppingLink = product.product_link;
              } else {
                googleShoppingLink = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(product.title)}`;
              }

              return {
                id:
                  product.product_id || `under6m-${Date.now()}-${productIndex}`,
                title: product.title,
                originalTitle: product.title,
                price: currentPrice,
                originalPrice: null,
                currency: "TRY",
                image: product.thumbnail || "/images/placeholder.jpg",
                description: product.snippet || product.title,
                originalDescription: product.snippet,
                link: product.link,
                googleShoppingLink: googleShoppingLink,
                source: product.source || "Google Shopping",
                rating: product.rating ? parseFloat(product.rating) : 4,
                reviews: product.reviews || 100,
                delivery: product.delivery || "",
                priceInRial: priceInRial,
              } as ShoppingProduct;
            })
            .filter(Boolean) as ShoppingProduct[];

          console.log(
            `📂 Filtered to ${filteredProducts.length} non-women's products under 6M Rials`
          );

          return filteredProducts;
        } else {
          return [];
        }
      } catch (error) {
        console.error(`❌ Error searching for query "${query}":`, error);
        return [];
      }
    });

    // Execute all search promises in parallel
    const searchResults = await Promise.all(searchPromises);

    // Flatten results
    searchResults.forEach((result) => {
      allProducts.push(...result);
    });

    // Remove duplicates based on title
    const uniqueProducts = allProducts.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.title === product.title)
    );

    // Sort by price (cheapest first) and take top 50 products (increased from 40)
    const finalProducts = uniqueProducts
      .sort((a, b) => a.priceInRial - b.priceInRial)
      .slice(0, 50); // Increased from 40 to 50

    console.log(
      `✅ Found ${finalProducts.length} unique products under 6M Rials`
    );

    // Ensure we have at least 16 products
    if (finalProducts.length < 16) {
      console.log(
        `⚠️ Only ${finalProducts.length} products found, need at least 16`
      );
      // Try to get more products by relaxing price constraints or fetching more
      if (uniqueProducts.length > finalProducts.length) {
        const additionalProducts = uniqueProducts
          .slice(50, 100) // Get more products from the remaining ones
          .filter((p) => p.priceInRial <= MAX_PRICE_RIAL * 1.2); // Allow slightly higher prices

        finalProducts.push(
          ...additionalProducts.slice(0, 16 - finalProducts.length)
        );
        console.log(
          `✅ Added ${Math.min(16 - finalProducts.length, additionalProducts.length)} additional products to reach minimum of 16`
        );
      }
    }

    // 4) Store in database
    try {
      // Clear existing products first
      await DiscountProduct.deleteMany({});

      // Insert new products
      const bulkOps = finalProducts.map((p) => ({
        insertOne: {
          document: {
            ...p,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours TTL
          },
        },
      }));

      if (bulkOps.length > 0) {
        await DiscountProduct.bulkWrite(bulkOps, { ordered: false });
        console.log(
          `💾 Stored ${bulkOps.length} products under 6M Rials in DB`
        );
      }
    } catch (e) {
      console.error("❌ Error storing products in DB:", e);
    }

    // 5) Cache the results in memory
    productsCache = {
      data: finalProducts,
      timestamp: now,
      ttl: CACHE_TTL,
    };

    return NextResponse.json({
      products: finalProducts,
      total: finalProducts.length,
      message:
        finalProducts.length > 0
          ? `${finalProducts.length} محصول زیر ۶ میلیون ریال یافت شد`
          : "هیچ محصولی زیر ۶ میلیون ریال یافت نشد",
      cached: false,
      source: "serpapi",
    });
  } catch (error) {
    console.error("❌ Error in products under 6M Rials search:", error);
    return NextResponse.json(
      {
        error: "خطا در جستجوی محصولات زیر ۶ میلیون ریال",
        products: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
