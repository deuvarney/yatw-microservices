import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const redis = new Redis({
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
      password: configService.get('REDIS_PASSWORD'),
      db: configService.get('REDIS_DB', 0),

      // Important: Don't throw errors on connection failure
      lazyConnect: false, // Connect immediately?

      // Connection options
      connectTimeout: 1000, // 10 seconds to establish connection
      commandTimeout: 5000, // 5 seconds for each command
      enableOfflineQueue: false, // Don't queue commands when offline
      maxRetriesPerRequest: 1, // Fail fast
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 1000);
      },
    });

    // Add all event handlers for visibility
    redis.on('connect', () => {
      console.log('📗 Redis CONNECT event - TCP connection established');
    });

    redis.on('ready', () => {
      console.log('✅ Redis READY event - Connection is ready for commands');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis ERROR event:', err.message);
    });

    redis.on('close', () => {
      console.warn('📕 Redis CLOSE event - Connection closed');
    });

    redis.on('reconnecting', (delay: number) => {
      console.log(`🔄 Redis RECONNECTING event - Reconnecting in ${delay}ms`);
    });

    redis.on('end', () => {
      console.warn('🛑 Redis END event - Connection ended');
    });

    redis.on('wait', () => {
      console.debug('⏳ Redis WAIT event - Waiting for connection');
    });
    return redis;
  },
};