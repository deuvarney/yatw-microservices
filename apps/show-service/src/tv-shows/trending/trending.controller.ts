import {
  Controller,
  Get,
  HttpStatus,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TrendingResponse } from 'moviedb-promise';
import { TvShowsResponseDto } from '../dto/tv-show-response.dto';
import { TvShowsService } from '../tv-shows.service';
// import { TmdbApiService } from '../tmdb-api/tmdb-api.service';

import { Response } from 'express';

@Controller('trending')
export class TrendingController {
  constructor(
    private readonly tvShowsService: TvShowsService,
    // private readonly tmdbApiService: TmdbApiService,
  ) {}

  @Get('tv/day')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Res() response: Response,
  ): Promise<TrendingResponse> {
    const tvShows = await this.tvShowsService.findAll(page);

    // Transform entity to response DTO
    const resp = plainToInstance(TvShowsResponseDto, tvShows.results, {
      excludeExtraneousValues: true,
    });

    return response
      .status(page > tvShows.total_pages ? HttpStatus.NOT_FOUND : HttpStatus.OK)
      .json({
        ...tvShows,
        results: resp,
      }) as TrendingResponse;
  }
}
