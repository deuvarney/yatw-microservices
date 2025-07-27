import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisProvider } from './redis.provider';

@Global()
@Module({
	providers: [
		RedisProvider,
		RedisService,
	],
	exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule { }
