// decorators/cache.decorator.ts
import { SetMetadata } from '@nestjs/common';

export interface CacheOptions {
  name?: string | ((context: any) => string);
  ttl?: number; // in seconds, default 3600 (1 hour)
  warm?: boolean; // whether this endpoint should be warmed
}

export const CACHE_KEY = 'CACHE_OPTIONS';
export const Cache = (options?: CacheOptions) => SetMetadata(CACHE_KEY, options || {});