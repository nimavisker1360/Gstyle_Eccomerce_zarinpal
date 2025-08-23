import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";
import { connectToDatabase } from "@/lib/db";
import DiscountProduct from "@/lib/db/models/discount-product.model";
import {
  getCachedDiscountProducts,
  setCachedDiscountProducts,
  DISCOUNT_CACHE_KEYS,
  CACHE_DURATIONS,
  getCacheAge,
} from "@/lib/discount-cache";

// Curated fashion-focused queries (targeting popular Turkish fashion retailers)
const discountQueries = [
  // Trendyol
  "Trendyol erkek giyim indirim",
  "Trendyol elbise indirim",
  "Trendyol ayakkabı çanta indirim",
  // LC Waikiki
  "LC Waikiki erkek indirim",
  "LC Waikiki çocuk giyim indirim",
  // DeFacto
  "DeFacto erkek indirim",
  // Koton
  "Koton elbise indirim",
  // Mavi
  "Mavi jean indirim",
  "Mavi tişört indirim",
  // Boyner
  "Boyner ayakkabı indirim",
  "Boyner çanta indirim",
  // Penti
  "Penti iç giyim indirim",
  // International brands present in TR
  "Zara indirim",
  "Bershka indirim",
  "Stradivarius indirim",
  "H&M indirim",
  // Generic fashion queries
  "erkek giyim büyük indirim",
  "elbise ayakkabı çanta kampanya",
  "moda giyim outlet fırsat",
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
}

// Simple in-memory cache for discount products
let discountCache: {
  data: ShoppingProduct[];
  timestamp: number;
  ttl: number;
} | null = null;

// Cache duration: 10 minutes for discounts
const DISCOUNT_CACHE_TTL = 10 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Starting discount products fetch...");
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "true";
    const isWarmup = url.searchParams.get("warmup") === "true";

    // 1) Try Redis cache first (unless forceRefresh or warmup)
    if (!forceRefresh && !isWarmup) {
      const redisCache = await getCachedDiscountProducts(
        DISCOUNT_CACHE_KEYS.DISCOUNT_PRODUCTS
      );
      if (
        redisCache &&
        redisCache.products &&
        redisCache.products.length >= 40
      ) {
        const cacheAge = getCacheAge(redisCache.timestamp);
        console.log(
          `✅ Returning ${redisCache.products.length} discount products from Redis cache (age: ${cacheAge} minutes)`
        );
        return NextResponse.json({
          ...redisCache,
          cached: true,
          source: "redis",
          cacheAge: `${cacheAge} minutes`,
        });
      }
    }

    // 2) Try DB (daily cache) first: limit 40 items priced under 2000 TRY (unless forceRefresh)
    await connectToDatabase();
    if (!forceRefresh) {
      const dbProducts = await DiscountProduct.find({
        price: { $lt: 2000 },
        expiresAt: { $gt: new Date() }, // Only non-expired products
      })
        .sort({ lastRefreshed: -1, createdAt: -1 })
        .limit(100)
        .lean();

      if (dbProducts && dbProducts.length >= 40) {
        // Already filtered by price in DB query; just normalize shape
        const normalized = dbProducts.map((p: any) => ({
          ...p,
        }));

        console.log(
          `✅ Returning ${normalized.length} under-2000₺ products from DB daily cache`
        );

        // Store in Redis for faster future access
        const responseData = {
          products: normalized.slice(0, 40),
          total: Math.min(normalized.length, 40),
          message: `${Math.min(normalized.length, 40)} محصول زیر ۲۰۰۰ لیر از کش روزانه (DB) یافت شد`,
          cached: true,
          source: "db",
          timestamp: Date.now(),
          version: 1,
        };

        // Cache in Redis for 24 hours
        await setCachedDiscountProducts(
          DISCOUNT_CACHE_KEYS.DISCOUNT_PRODUCTS,
          responseData,
          CACHE_DURATIONS.DISCOUNT_PRODUCTS
        );

        return NextResponse.json(responseData);
      }
    }

    // 3) Fall back to in-memory cache
    const now = Date.now();
    if (
      !forceRefresh &&
      discountCache &&
      now - discountCache.timestamp < discountCache.ttl
    ) {
      console.log("✅ Returning cached discount products from memory");
      return NextResponse.json({
        products: discountCache.data,
        total: discountCache.data.length,
        message: `${discountCache.data.length} محصول تخفیف از کش حافظه یافت شد`,
        cached: true,
        source: "memory",
        timestamp: discountCache.timestamp,
        version: 1,
      });
    }

    // Check if API keys are available
    if (!process.env.SERPAPI_KEY) {
      console.error("❌ SERPAPI_KEY is not configured");
      return NextResponse.json(
        { error: "Search service is not configured" },
        { status: 500 }
      );
    }

    let allProducts: ShoppingProduct[] = [];

    // Add randomization for diverse results each time
    // Shuffle the queries array to get different results on each request
    const shuffledQueries = [...discountQueries].sort(
      () => Math.random() - 0.5
    );

    // Add random variation words to bias towards very cheap items
    const randomVariations = [
      "en uygun",
      "özel fiyat",
      "ucuz",
      "avantajlı",
      "ekonomik",
      "uygun",
      "1 tl",
      "2 tl",
      "2 tl altında",
    ];

    // البحث باستخدام استفسارات متعددة للحصول على منتجات متنوعة
    // Reduced from 3 to 2 parallel requests for better performance
    const maxQueries = 2;
    const selectedQueries = shuffledQueries.slice(0, maxQueries);

    // Use Promise.all for parallel requests instead of sequential
    const searchPromises = selectedQueries.map(async (baseQuery, i) => {
      let query = baseQuery;

      // Add random variation 40% of the time
      if (Math.random() > 0.6) {
        const randomWord =
          randomVariations[Math.floor(Math.random() * randomVariations.length)];
        query = `${query} ${randomWord}`;
        console.log(`🎲 Added variation: "${randomWord}" to query`);
      }
      console.log(`🔍 Searching with query ${i + 1}: "${query}"`);

      try {
        const serpApiParams = {
          engine: "google_shopping",
          q: query,
          gl: "tr", // تركيا
          hl: "tr", // اللغة التركية
          location: "Turkey",
          num: 20, // عدد النتائج لكل استفسار
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

          // Filter products to only include header categories
          const filteredProducts = shoppingResults.shopping_results.filter(
            (product: any) => {
              const title = (product.title || "").toLowerCase();
              const description = (product.snippet || "").toLowerCase();
              const combined = title + " " + description;

              const fashionKeywords = [
                "giyim",
                "elbise",
                "pantolon",
                "gömlek",
                "tişört",
                "kazak",
                "mont",
                "ceket",
                "ayakkabı",
                "çanta",
                "aksesuar",
                "jean",
                "etek",
                "bluz",
                "şort",
                "mayo",
                "moda",
                "fashion",
                "dress",
                "shirt",
                "pants",
                "shoes",
                "bag",
                "clothing",
                "kıyafet",
                "terlik",
                "bot",
                "sandalet",
                "spor ayakkabı",
                "sneaker",
                // brand mentions
                "trendyol",
                "lc waikiki",
                "defacto",
                "koton",
                "mavi",
                "boyner",
                "penti",
                "zara",
                "bershka",
                "stradivarius",
                "h&m",
              ];

              return fashionKeywords.some((keyword) =>
                combined.includes(keyword)
              );
            }
          );

          console.log(
            `📂 Filtered to ${filteredProducts.length} products from header categories`
          );

          // پردازش نتایج: فقط محصولات با قیمت ≤ 2000 لیر
          const processedProducts = filteredProducts
            .slice(0, 30)
            .map((product: any, index: number) => {
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

              // If still not a number or price is not under/eq 2000 TRY, skip
              if (
                !Number.isFinite(currentPrice) ||
                currentPrice <= 0 ||
                currentPrice > 2000
              ) {
                return null;
              }

              // Build product
              let googleShoppingLink = "";
              if (product.product_id) {
                googleShoppingLink = `https://www.google.com.tr/shopping/product/${product.product_id}?gl=tr`;
              } else if (product.product_link) {
                googleShoppingLink = product.product_link;
              } else {
                googleShoppingLink = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(product.title)}`;
              }

              const persianTitle = product.title;

              return {
                id: product.product_id || `discount-${Date.now()}-${index}`,
                title: persianTitle,
                originalTitle: product.title,
                price: currentPrice,
                originalPrice: null,
                currency: "TRY",
                image: product.thumbnail || "/images/placeholder.jpg",
                description: product.snippet || persianTitle,
                originalDescription: product.snippet,
                link: product.link,
                googleShoppingLink: googleShoppingLink,
                source: product.source || "Google Shopping",
                rating: product.rating ? parseFloat(product.rating) : 4,
                reviews: product.reviews || 100,
                delivery: product.delivery || "",
              } as ShoppingProduct;
            })
            .filter(Boolean) as ShoppingProduct[];

          return processedProducts;
        } else {
          return [];
        }
      } catch (error) {
        console.error(`Error searching for query "${query}":`, error);
        return [];
      }
    });

    // Execute all search promises in parallel
    const searchResults = await Promise.all(searchPromises);

    // Flatten results
    searchResults.forEach((result) => {
      allProducts.push(...result);
    });

    // إزالة المنتجات المكررة بناءً على العنوان
    const uniqueProducts = allProducts.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.title === product.title)
    );

    // Final filter to ensure all products are from header categories
    const categoryFilteredProducts = uniqueProducts.filter((product) => {
      // Create a mock product object for the filter function
      const mockProduct = {
        title: product.originalTitle || product.title,
        snippet: product.originalDescription || product.description,
      };
      return (
        (product.originalTitle || product.title)
          .toLowerCase()
          .includes("indirim") ||
        (product.originalDescription || product.description)
          .toLowerCase()
          .includes("indirim")
      );
    });

    console.log(
      `🎯 Final category filter: ${uniqueProducts.length} → ${categoryFilteredProducts.length} products`
    );

    // Only keep products priced at or under 2000 TRY
    const underTwoLira = categoryFilteredProducts
      .filter(
        (p) => typeof p.price === "number" && p.price > 0 && p.price <= 2000
      )
      .sort((a, b) => b.rating - a.rating);

    // Pick top 40 products for daily set
    const finalProducts = underTwoLira.slice(0, 40);

    console.log(`✅ Returning ${finalProducts.length} products priced ≤ 2000₺`);

    // 3) Upsert into DB as daily cache (ensure 40 stored)
    try {
      // Map existing records to compute previousPrice
      const ids = finalProducts.map((p) => p.id);
      const existingRecords = await DiscountProduct.find({ id: { $in: ids } })
        .select("id price previousPrice originalPrice")
        .lean();
      const idToExisting: Record<string, any> = Object.create(null);
      for (const ex of existingRecords) {
        idToExisting[ex.id] = ex;
      }

      const bulkOps = finalProducts.map((p) => ({
        updateOne: {
          filter: { id: p.id },
          update: {
            $set: {
              // Persist originalPrice so UI can compute % off and show old/new prices
              ...p,
              // Set previousPrice to last stored price when price changes
              previousPrice:
                idToExisting[p.id] &&
                typeof idToExisting[p.id].price === "number"
                  ? idToExisting[p.id].price !== p.price
                    ? idToExisting[p.id].price
                    : (idToExisting[p.id].previousPrice ??
                      idToExisting[p.id].price)
                  : null,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          },
          upsert: true,
        },
      }));
      if (bulkOps.length > 0) {
        await DiscountProduct.bulkWrite(bulkOps, { ordered: false });
        console.log(`💾 Upserted ${bulkOps.length} discount products into DB`);
      }

      // Remove products that are no longer discounted or no longer present in the latest fetch
      if (finalProducts.length > 0) {
        const currentIds = finalProducts.map((p) => p.id);
        const removalResult = await DiscountProduct.deleteMany({
          id: { $nin: currentIds },
        });
        console.log(
          `🗑️ Removed ${removalResult.deletedCount || 0} products no longer present in the latest under-2000₺ list`
        );

        // Additionally, remove any records priced ≥ 2000 TRY (safety net)
        const invalidDiscountRemoval = await DiscountProduct.deleteMany({
          price: { $gte: 2000 },
        });
        if (invalidDiscountRemoval.deletedCount) {
          console.log(
            `🧹 Cleaned ${invalidDiscountRemoval.deletedCount} records priced ≥ 2000₺ from DB`
          );
        }
      }
    } catch (e) {
      console.error("❌ Error upserting discount products to DB:", e);
    }

    // After processing and storing in DB, also cache in Redis
    const responseData = {
      products: finalProducts,
      total: finalProducts.length,
      message: `${finalProducts.length} محصول تخفیف یافت شد`,
      cached: false,
      source: "serpapi",
      timestamp: now,
      version: 1,
    };

    // Store in Redis for 24 hours
    await setCachedDiscountProducts(
      DISCOUNT_CACHE_KEYS.DISCOUNT_PRODUCTS,
      responseData,
      CACHE_DURATIONS.DISCOUNT_PRODUCTS
    );

    // Cache in memory for 10 minutes
    discountCache = {
      data: finalProducts,
      timestamp: now,
      ttl: DISCOUNT_CACHE_TTL,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Error in discount products search:", error);
    return NextResponse.json(
      {
        error: "خطا در جستجوی محصولات تخفیف",
        products: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
