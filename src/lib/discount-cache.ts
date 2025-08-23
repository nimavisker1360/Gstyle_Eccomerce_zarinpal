import { redis, redisGet, redisSet, ONE_DAY_SECONDS } from "./redis";

// Cache keys for discount products
export const DISCOUNT_CACHE_KEYS = {
  PRODUCTS_UNDER_6M: "discount:products:under6m",
  PRODUCTS_UNDER_6M_TIMESTAMP: "discount:products:under6m:timestamp",
  PRODUCTS_UNDER_6M_VERSION: "discount:products:under6m:version",
  DISCOUNT_PRODUCTS: "discount:products:all",
  DISCOUNT_PRODUCTS_TIMESTAMP: "discount:products:all:timestamp",
  DISCOUNT_PRODUCTS_VERSION: "discount:products:all:version",
  COMBINED_DISCOUNTS: "discount:products:combined",
  COMBINED_DISCOUNTS_TIMESTAMP: "discount:products:combined:timestamp",
  COMBINED_DISCOUNTS_VERSION: "discount:products:combined:version",
} as const;

// Cache durations in seconds
export const CACHE_DURATIONS = {
  PRODUCTS_UNDER_6M: 72 * 60 * 60, // 72 hours
  DISCOUNT_PRODUCTS: 24 * 60 * 60, // 24 hours
  COMBINED_DISCOUNTS: 12 * 60 * 60, // 12 hours
  CLIENT_SIDE: 30 * 60, // 30 minutes for client-side cache
} as const;

export interface DiscountCacheData {
  products: any[];
  total: number;
  message: string;
  cached: boolean;
  source: string;
  timestamp: number;
  version: number;
}

/**
 * Get cached discount products from Redis
 */
export async function getCachedDiscountProducts<T = any>(
  cacheKey: string
): Promise<T | null> {
  try {
    const cached = await redisGet<T>(cacheKey);
    if (cached) {
      console.log(`✅ Retrieved from Redis cache: ${cacheKey}`);
      return cached;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error getting from Redis cache ${cacheKey}:`, error);
    return null;
  }
}

/**
 * Set discount products in Redis cache
 */
export async function setCachedDiscountProducts(
  cacheKey: string,
  data: any,
  duration: number = CACHE_DURATIONS.PRODUCTS_UNDER_6M
): Promise<void> {
  try {
    await redisSet(cacheKey, data, { ex: duration });
    console.log(`💾 Stored in Redis cache: ${cacheKey} (TTL: ${duration}s)`);
  } catch (error) {
    console.error(`❌ Error setting Redis cache ${cacheKey}:`, error);
  }
}

/**
 * Check if cache is still valid
 */
export function isCacheValid(
  timestamp: number,
  maxAge: number = CACHE_DURATIONS.PRODUCTS_UNDER_6M * 1000
): boolean {
  const now = Date.now();
  return now - timestamp < maxAge;
}

/**
 * Get cache age in minutes
 */
export function getCacheAge(timestamp: number): number {
  const now = Date.now();
  return Math.floor((now - timestamp) / (60 * 1000));
}

/**
 * Invalidate specific cache keys
 */
export async function invalidateCache(cacheKeys: string[]): Promise<void> {
  try {
    for (const key of cacheKeys) {
      await redis.del(key);
      console.log(`🗑️ Invalidated cache: ${key}`);
    }
  } catch (error) {
    console.error("❌ Error invalidating cache:", error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
}> {
  try {
    const info = await redis.info("memory");
    const keyspace = await redis.info("keyspace");

    // Parse memory info
    const memoryMatch = info.match(/used_memory_human:(\S+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1] : "Unknown";

    // Parse keyspace info
    const keysMatch = keyspace.match(/keys=(\d+)/);
    const totalKeys = keysMatch ? parseInt(keysMatch[1]) : 0;

    return {
      totalKeys,
      memoryUsage,
      hitRate: 0, // Would need to implement hit tracking
    };
  } catch (error) {
    console.error("❌ Error getting cache stats:", error);
    return {
      totalKeys: 0,
      memoryUsage: "Unknown",
      hitRate: 0,
    };
  }
}

/**
 * Warm up cache by pre-fetching popular data
 */
export async function warmUpCache(): Promise<void> {
  try {
    console.log("🔥 Warming up discount products cache...");

    // Pre-fetch products under 6M
    const response = await fetch(
      `${process.env.PUBLIC_APP_URL || "http://localhost:3000"}/api/shopping/products-under-6m?warmup=true`
    );
    if (response.ok) {
      console.log("✅ Cache warm-up completed for products under 6M");
    }

    // Pre-fetch discount products
    const discountResponse = await fetch(
      `${process.env.PUBLIC_APP_URL || "http://localhost:3000"}/api/shopping/discounts?warmup=true`
    );
    if (discountResponse.ok) {
      console.log("✅ Cache warm-up completed for discount products");
    }
  } catch (error) {
    console.error("❌ Cache warm-up failed:", error);
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<void> {
  try {
    console.log("🧹 Cleaning up expired cache entries...");

    // Redis automatically handles TTL, but we can clean up any orphaned keys
    const keys = await redis.keys("discount:*");
    let cleaned = 0;

    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        // No TTL set
        await redis.del(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🗑️ Cleaned up ${cleaned} orphaned cache entries`);
    }
  } catch (error) {
    console.error("❌ Cache cleanup failed:", error);
  }
}
