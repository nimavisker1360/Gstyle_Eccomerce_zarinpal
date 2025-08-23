import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import DiscountProduct from "@/lib/db/models/discount-product.model";
import {
  warmUpCache,
  cleanupExpiredCache,
  getCacheStats,
  invalidateCache,
  DISCOUNT_CACHE_KEYS,
} from "@/lib/discount-cache";

// Cron job to refresh discount products every 72 hours
export async function GET(request: NextRequest) {
  try {
    // Hard disable unless explicitly enabled to avoid SerpApi usage from cron
    if (process.env.CRON_REFRESH_ENABLED !== "true") {
      return NextResponse.json({
        success: true,
        disabled: true,
        message:
          "Cron refresh is disabled (CRON_REFRESH_ENABLED != 'true'). No SerpApi calls made.",
      });
    }

    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const action = searchParams.get("action") || "refresh";

    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const origin = process.env.PUBLIC_APP_URL || "";
    if (!origin) {
      console.warn(
        "⚠️ PUBLIC_APP_URL not set; using hostless fetch may fail in serverless"
      );
    }

    let results: any = {};

    switch (action) {
      case "refresh":
        // Refresh discount products
        console.log("🔄 Starting discount products refresh...");

        try {
          // Refresh products under 6M
          const under6MResponse = await fetch(
            `${origin}/api/shopping/products-under-6m?refresh=true`,
            { method: "GET", cache: "no-store" }
          );

          if (under6MResponse.ok) {
            const under6MData = await under6MResponse.json();
            results.productsUnder6M = {
              status: under6MResponse.status,
              count: under6MData.products?.length || 0,
              message: under6MData.message,
            };
            console.log("✅ Products under 6M refreshed successfully");
          } else {
            results.productsUnder6M = {
              status: under6MResponse.status,
              error: "Failed to refresh products under 6M",
            };
          }

          // Refresh discount products
          const discountResponse = await fetch(
            `${origin}/api/shopping/discounts?refresh=true`,
            { method: "GET", cache: "no-store" }
          );

          if (discountResponse.ok) {
            const discountData = await discountResponse.json();
            results.discountProducts = {
              status: discountResponse.status,
              count: discountData.products?.length || 0,
              message: discountData.message,
            };
            console.log("✅ Discount products refreshed successfully");
          } else {
            results.discountProducts = {
              status: discountResponse.status,
              error: "Failed to refresh discount products",
            };
          }
        } catch (error) {
          console.error("❌ Error refreshing products:", error);
          results.error = "Failed to refresh products";
        }
        break;

      case "warmup":
        // Warm up cache
        console.log("🔥 Warming up cache...");
        await warmUpCache();
        results.warmup = "Cache warm-up completed";
        break;

      case "cleanup":
        // Clean up expired cache
        console.log("🧹 Cleaning up expired cache...");
        await cleanupExpiredCache();
        results.cleanup = "Cache cleanup completed";
        break;

      case "stats":
        // Get cache statistics
        console.log("📊 Getting cache statistics...");
        const stats = await getCacheStats();
        results.stats = stats;
        break;

      case "invalidate":
        // Invalidate all discount caches
        console.log("🗑️ Invalidating discount caches...");
        await invalidateCache([
          DISCOUNT_CACHE_KEYS.PRODUCTS_UNDER_6M,
          DISCOUNT_CACHE_KEYS.DISCOUNT_PRODUCTS,
          DISCOUNT_CACHE_KEYS.COMBINED_DISCOUNTS,
        ]);
        results.invalidate = "All discount caches invalidated";
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get database statistics
    try {
      const totalProducts = await DiscountProduct.countDocuments();
      const expiredProducts = await DiscountProduct.countDocuments({
        expiresAt: { $lt: new Date() },
      });
      const activeProducts = await DiscountProduct.countDocuments({
        expiresAt: { $gt: new Date() },
      });

      results.database = {
        totalProducts,
        expiredProducts,
        activeProducts,
        lastRefresh: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error getting database stats:", error);
      results.database = { error: "Failed to get database stats" };
    }

    return NextResponse.json({
      success: true,
      action,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Discount refresh cron failed:", error);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
