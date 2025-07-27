import {
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TrendingResponse } from 'moviedb-promise';
import { TvShowsResponseDto } from '../dto/tv-show-response.dto';
import { TvShowsService } from '../tv-shows.service';
// import { TmdbApiService } from '../tmdb-api/tmdb-api.service';

import { ExternalApiFallbackInterceptor } from 'src/interceptors/external-api-fallback.interceptor';
import { CacheInterceptor } from 'src/redis/interceptors/cache.interceptor';
import { Cache } from 'src/redis/decorators/cache.decorator';

@Controller('trending')
@UseInterceptors(CacheInterceptor)
export class TrendingController {
  constructor(
    private readonly tvShowsService: TvShowsService,
    // private readonly tmdbApiService: TmdbApiService,
  ) { }

  @Get('tv/day')
  @UseInterceptors(ExternalApiFallbackInterceptor)
  @Cache()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
  ): Promise<TrendingResponse> {
    const tvShows = await this.tvShowsService.findAll(page);

    // Transform entity to response DTO
    const resp = plainToInstance(TvShowsResponseDto, tvShows.results, {
      excludeExtraneousValues: true,
    });

    // TODO: Add logic so that the cache interceptor does not cache if page > tvShows.total_pages
    if (page > tvShows.total_pages) {
      throw new NotFoundException(`Page ${page} not found`);
    }

    return {
      ...tvShows,
      results: resp,
    } as TrendingResponse
  }
}
