import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

const SHOW_CONNECTION_LOGS = false;

@Injectable()
export class RedisService implements OnModuleDestroy {
  private isConnected = false;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {

    // Check connection status
    this.isConnected = this.redis.status === 'ready';

    // Monitor connection status
    this.redis.on('connect', () => {
      this.isConnected = true;
      console.log('Redis connection established');
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      console.warn('Redis connection lost');
    });

    this.redis.on('error', (err) => {
      this.isConnected = false;
      console.error('Redis error:', err.message);
    });

  }

  /**
 * Check if Redis is available
 */
  isAvailable(): boolean {
    return this.isConnected && this.redis.status === 'ready';
  }

  /**
 * Get with fallback
 */
  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) {
      SHOW_CONNECTION_LOGS && console.debug(`Redis unavailable, skipping get for key: ${key}`);
      return null;
    }

    try {
      return await this.redis.get(key);
    } catch (error) {
      SHOW_CONNECTION_LOGS && console.error(`Redis get error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set with silent failure
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      SHOW_CONNECTION_LOGS && console.debug(`Redis unavailable, skipping set for key: ${key}`);
      return false;
    }

    try {
      if (ttlSeconds) {
        await this.redis.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      SHOW_CONNECTION_LOGS && console.error(`Redis set error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Get JSON with fallback
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(`JSON parse error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set JSON with silent failure
   */
  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttlSeconds);
    } catch (error) {
      console.error(`JSON stringify error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete with silent failure
   */
  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      SHOW_CONNECTION_LOGS && console.debug(`Redis unavailable, skipping del for key: ${key}`);
      return false;
    }

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error(`Redis del error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Execute a Redis operation with fallback
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback: T,
    operationName: string
  ): Promise<T> {
    if (!this.isAvailable()) {
      SHOW_CONNECTION_LOGS && console.debug(`Redis unavailable for operation: ${operationName}`);
      return fallback;
    }

    try {
      return await operation();
    } catch (error) {
      console.error(`Redis operation ${operationName} failed:`, error.message);
      return fallback;
    }
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

}

/*
typescript// Example usage in a service
@Injectable()
export class TvShowsService {
  constructor(
    private redisService: RedisService,
    // ... other dependencies
  ) {}

  async getCachedShow(id: number) {
    return this.redisService.getJSON(`tvshow:${id}`);
  }

  async cacheShow(id: number, data: any) {
    await this.redisService.setJSON(`tvshow:${id}`, data, 3600); // 1 hour TTL
  }
}
*/