
// import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
// import { Observable, of } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { Reflector } from '@nestjs/core';
// import { RedisService } from '../redis.service';
// import { CACHE_KEY, CacheOptions } from '../decorators/cache.decorator';
// import { ServerResponse } from 'node:http';

// @Injectable()
// export class CacheInterceptor implements NestInterceptor {
//   private readonly DEFAULT_TTL = 3600; // 1 hour

//   constructor(
//     private reflector: Reflector,
//     private redisService: RedisService,
//   ) {}

//   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
//     const cacheOptions = this.reflector.get<CacheOptions>(
//       CACHE_KEY,
//       context.getHandler()
//     );

//     // If no cache decorator, proceed without caching
//     if (!cacheOptions) {
//       return next.handle();
//     }

//     const request = context.switchToHttp().getRequest();
//     const cacheKey = this.generateCacheKey(context, cacheOptions, request);
//     const ttl = cacheOptions.ttl || this.DEFAULT_TTL;

//     // Try to get from cache
//     const cachedData = await this.redisService.getJSON(cacheKey);
//     if (cachedData) {
//       console.log(`Cache hit: ${cacheKey}`);
//       return of(cachedData);
//     }

//     console.log(`Cache miss: ${cacheKey}`);
//     return next.handle().pipe(
//       tap(async (data) => {
//         const dataBody = data?.json() ?? data;
//         await this.redisService.setJSON(cacheKey, dataBody, ttl);
//         console.log(`Cached: ${cacheKey} for ${ttl}s`);
//       }),
//     );
//   }

//   private generateCacheKey(
//     context: ExecutionContext,
//     options: CacheOptions,
//     request: any
//   ): string {
//     let keyName: string;

//     if (options.name) {
//       if (typeof options.name === 'function') {
//         keyName = options.name({ request, context });
//       } else {
//         keyName = options.name;
//       }
//     } else {
//       // Default key generation
//       const className = context.getClass().name;
//       const methodName = context.getHandler().name;
//       keyName = `${className}:${methodName}`;
//     }

//     // Add request-specific data to make key unique
//     const { params, query } = request;
//     const paramStr = Object.keys(params).length ? `:${JSON.stringify(params)}` : '';
//     const queryStr = Object.keys(query).length ? `:${JSON.stringify(query)}` : '';

//     return `cache:${keyName}${paramStr}${queryStr}`;
//   }
// }

// interceptors/cache.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis.service';
import { CACHE_KEY, CacheOptions } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private readonly DEFAULT_TTL = 3600; // 1 hour

    constructor(
        private reflector: Reflector,
        private redisService: RedisService,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const cacheOptions = this.reflector.get<CacheOptions>(
            CACHE_KEY,
            context.getHandler()
        );

        if (!cacheOptions || !this.redisService.isAvailable()) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const cacheKey = this.generateCacheKey(context, cacheOptions, request);
        const ttl = cacheOptions.ttl || this.DEFAULT_TTL;

        // Try to get from cache
        try {
            const cachedData = await this.redisService.getJSON(cacheKey);
            if (cachedData) {
                console.log(`Cache hit: ${cacheKey}`);

                // Set cache headers
                const response = context.switchToHttp().getResponse();
                response.setHeader('X-Cache', 'HIT');
                response.setHeader('X-Cache-Key', cacheKey);

                // Return cached data as Observable
                return of(cachedData);
            }
        } catch (error) {
            console.error('Cache get error:', error);
        }

        console.log(`Cache miss: ${cacheKey}`);

        // Process the request and cache the result
        return next.handle().pipe(
            map(data => {
                // This ensures we get the actual data, not the response object
                return data;
            }),
            tap(async (data) => {
                try {
                    // Only cache if we have actual data (not response object)
                    if (data && typeof data === 'object' && !data.finished) {
                        await this.redisService.setJSON(cacheKey, data, ttl);
                        console.log(`Cached: ${cacheKey} for ${ttl}s`);

                        // Set cache headers
                        // const response = context.switchToHttp().getResponse();
                        // response.setHeader('X-Cache', 'MISS');
                        // response.setHeader('X-Cache-TTL', ttl.toString());
                    }
                } catch (error) {
                    console.error('Cache set error:', error);
                    // Don't throw - let the response continue even if caching fails
                }
            })
        );
    }

    private generateCacheKey(
        context: ExecutionContext,
        options: CacheOptions,
        request: any
    ): string {
        let keyName: string;

        if (options.name) {
            if (typeof options.name === 'function') {
                keyName = options.name({ request, context });
            } else {
                keyName = options.name;
            }
        } else {
            const className = context.getClass().name;
            const methodName = context.getHandler().name;
            keyName = `${className}:${methodName}`;
        }

        const { params = {}, query = {} } = request;
        const paramStr = Object.keys(params).length ? `:${JSON.stringify(params)}` : '';
        const queryStr = Object.keys(query).length ? `:${JSON.stringify(query)}` : '';

        return `cache:${keyName}${paramStr}${queryStr}`;
    }
}

/* 
Usage 
@UseInterceptors(CacheInterceptor) // Apply to all routes in controller

  // Simple usage with default TTL (1 hour)
  @Cache()


  // Custom TTL (5 minutes)
  @Cache({ ttl: 300 })


  // Custom key name
  @Cache({ name: 'custom-key' })

// Custom name as function
  @Cache({
    name: ({ request }) => `show-${request.params.id}-seasons`,
    ttl: 3600,
    warm: true, // Mark for warming
  })
*/