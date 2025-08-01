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
@UseInterceptors(CacheInterceptor, ExternalApiFallbackInterceptor)
export class TrendingController {
  constructor(
    private readonly tvShowsService: TvShowsService,
    // private readonly tmdbApiService: TmdbApiService,
  ) { }

  @Get('tv/day')
  @Cache()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
  ): Promise<TrendingResponse> {

    const trendingPageShowsInfo = await this.tvShowsService.findTrendingShows(page);

    if (!trendingPageShowsInfo) {
      throw new NotFoundException(`Page ${page} not found`);
    }

    const resp = plainToInstance(TvShowsResponseDto, trendingPageShowsInfo.results, {
      excludeExtraneousValues: true,
    });
    return resp as TrendingResponse;
  }
}
