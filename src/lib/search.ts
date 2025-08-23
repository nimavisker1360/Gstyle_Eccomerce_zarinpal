import {
  redisSet,
  redisGet,
  getRedisKeyForQuery,
  ONE_HOUR_SECONDS,
} from "@/lib/redis";
import GoogleShoppingProduct from "@/lib/db/models/google-shopping-product.model";
import { connectToDatabase } from "@/lib/db";

export function normalizeQuery(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\u200E\u200F]/g, "") // remove LRM/RLM
    .replace(/[^\p{L}\p{N}\s]+/gu, "") // remove punctuation/symbols
    .replace(/\s+/g, " "); // collapse spaces
}

export function getNormalizedCacheKey(query: string): string {
  return normalizeQuery(query);
}

export type ProductsResponse = {
  products: any[];
  total?: number;
  search_query: string;
  message?: string;
  enhanced_query?: string;
  query_type?: string;
  cached?: boolean;
  from_redis?: boolean;
  from_database?: boolean;
};

export type SerpFetcher = (
  normalizedKey: string,
  originalQuery: string
) => Promise<ProductsResponse>;

export async function getProducts(
  query: string,
  fetchFromSerpApi: SerpFetcher
): Promise<ProductsResponse> {
  const normalizedKey = getNormalizedCacheKey(query);
  const redisKey = getRedisKeyForQuery(normalizedKey);

  // 1) Redis short-term cache (1 hour)
  try {
    const cached = await redisGet<ProductsResponse>(redisKey);
    if (cached) {
      return { ...cached, cached: true, from_redis: true };
    }
  } catch (e) {
    console.error("❌ Redis get error:", e);
  }

  // 2) Mongo long-term cache (3 days via TTL on model)
  try {
    await connectToDatabase();
    const hasEnough = await GoogleShoppingProduct.hasEnoughCachedProducts(
      normalizedKey,
      30
    );
    if (hasEnough) {
      const cachedProducts = await GoogleShoppingProduct.getCachedProducts(
        normalizedKey,
        60
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
      const dbResponse: ProductsResponse = {
        products: formattedProducts,
        total: formattedProducts.length,
        search_query: query,
        cached: true,
        from_database: true,
      };
      // Backfill Redis
      try {
        await redisSet(redisKey, dbResponse, { ex: ONE_HOUR_SECONDS });
      } catch {}
      return dbResponse;
    }
  } catch (e) {
    console.error("❌ DB cache error:", e);
  }

  // 3) Fall back to SerpApi and cache both layers
  const fresh = await fetchFromSerpApi(normalizedKey, query);
  try {
    await redisSet(redisKey, fresh, { ex: ONE_HOUR_SECONDS });
  } catch (e) {
    console.error("❌ Redis set error:", e);
  }
  return fresh;
}
