import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";
import { redisSet, ONE_DAY_SECONDS, getRedisKeyForQuery } from "@/lib/redis";

// Daily refresh cron: refresh popular queries by re-fetching via main API and updating Redis+Mongo
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

    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Determine list of queries to refresh: distinct categories act as normalized cache keys
    const categories: string[] =
      await GoogleShoppingProduct.distinct("category");

    // Only refresh a limited number per run
    const maxToRefresh = Math.min(categories.length, 30);
    const targets = categories.slice(0, maxToRefresh);

    const origin = process.env.PUBLIC_APP_URL || ""; // e.g. https://your-app.vercel.app
    if (!origin) {
      console.warn(
        "⚠️ PUBLIC_APP_URL not set; using hostless fetch may fail in serverless"
      );
    }

    let refreshed = 0;
    const results: Array<{ key: string; status: number; count?: number }> = [];

    for (const category of targets) {
      try {
        // In the new model, category is the normalized query key itself
        const q = category;
        const url = `${origin}/api/shopping?q=${encodeURIComponent(q)}&force=1`;
        const res = await fetch(url, { method: "GET", cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          refreshed += 1;
          results.push({
            key: category,
            status: res.status,
            count: data.products?.length,
          });
          // Best-effort: write the fresh data to Redis using normalized key
          try {
            const redisKey = getRedisKeyForQuery(category);
            await redisSet(redisKey, data, { ex: ONE_DAY_SECONDS });
          } catch {}
        } else {
          results.push({ key: category, status: res.status });
        }
      } catch (e) {
        results.push({ key: category, status: 0 });
      }
    }

    return NextResponse.json({
      success: true,
      refreshed,
      totalTargets: targets.length,
      details: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Refresh cron failed:", error);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
