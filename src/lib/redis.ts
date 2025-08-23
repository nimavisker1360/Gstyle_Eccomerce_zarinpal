import Redis from "ioredis";

type GlobalWithRedis = typeof globalThis & {
  __ioRedis?: Redis;
};

const g = global as GlobalWithRedis;

function createRedisClient() {
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  if (!url) {
    // Provide a minimal in-memory fallback to avoid build-time failures
    // when Redis env vars are not present (e.g., during static analysis).
    console.warn("⚠️ REDIS_URL not set; using in-memory Redis mock.");
    const store = new Map<string, { value: string; exp?: number }>();
    const now = () => Date.now();
    const mock: any = {
      get: async (key: string) => {
        const entry = store.get(key);
        if (!entry) return null;
        if (entry.exp && entry.exp < now()) {
          store.delete(key);
          return null;
        }
        return entry.value;
      },
      set: async (key: string, value: string, mode?: string, ex?: number) => {
        let exp: number | undefined = undefined;
        if (mode === "EX" && typeof ex === "number") {
          exp = now() + ex * 1000;
        }
        store.set(key, { value, exp });
        return "OK";
      },
      del: async (key: string) => {
        return store.delete(key) ? 1 : 0;
      },
    };
    return mock as Redis;
  }
  // ioredis accepts full rediss:// URL
  return new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
  });
}

export const redis: Redis = g.__ioRedis || createRedisClient();
if (!g.__ioRedis) {
  g.__ioRedis = redis;
}

export const ONE_HOUR_SECONDS = 60 * 60;
export const ONE_DAY_SECONDS = 24 * 60 * 60;

export function getRedisKeyForQuery(query: string) {
  return `search:v2:${query.toLowerCase().trim()}`;
}

// Convenience wrappers to mirror previous API with { ex } option
export async function redisGet<T = any>(key: string): Promise<T | null> {
  const val = await redis.get(key);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return val as unknown as T;
  }
}

export async function redisSet(
  key: string,
  value: any,
  options?: { ex?: number }
): Promise<"OK" | null> {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  if (options?.ex) {
    return await redis.set(key, stringValue, "EX", options.ex);
  }
  return await redis.set(key, stringValue);
}
