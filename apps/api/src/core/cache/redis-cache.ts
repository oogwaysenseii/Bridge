import type { Cache } from "./cache.interface.js";
import { redis } from "./redis.client.js";

export class RedisCache implements Cache {
  public async get(key: string): Promise<string | null> {
    const value = await redis.get(key);
    return value;
  }

  public async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await redis.set(key, value, "EX", ttlSeconds);
  }

  public async del(key: string): Promise<void> {
    await redis.del(key);
  }
}

export const defaultCache: Cache = new RedisCache();
