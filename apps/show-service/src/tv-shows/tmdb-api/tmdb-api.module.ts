import { Module } from '@nestjs/common';
import { TmdbApiService } from './tmdb-api.service';
import { TmdbApiController } from './tmdb-api.controller';

@Module({
  providers: [TmdbApiService],
  controllers: [TmdbApiController],
  exports: [TmdbApiService],
})
export class TMDBApiModule {}
