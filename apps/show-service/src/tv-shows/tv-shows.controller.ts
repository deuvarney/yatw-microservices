// src/tv-shows/tv-shows.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ValidationPipe,
  Query,
  ParseIntPipe,
  HttpStatus,
  Res,
  NotFoundException,
  Req,
} from '@nestjs/common';

import { TvShowsService } from './tv-shows.service';
import { TmdbApiService } from './tmdb-api/tmdb-api.service';
import { CreateTvShowDto } from './dto/create-tv-show.dto';
import {
  DetailedSeasonResponseDto,
  TVShowResponseDto,
  TvShowsResponseDto,
} from './dto/tv-show-response.dto';
import {
  instanceToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { TrendingResponse } from 'moviedb-promise';
// import snakeCase from 'lodash/snakeCase';

import _ from 'lodash';
import { transform, isArray, isObject, camelCase } from 'lodash';

function camelize(obj) {
  return transform(obj, (result, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(key);
    result[camelKey] = isObject(value) ? camelize(value) : value;
  });
}

function snakeToCamelCaseKeys(obj) {
  if (_.isArray(obj)) {
    return _.map(obj, snakeToCamelCaseKeys);
  } else if (_.isObject(obj) && !_.isNull(obj)) {
    return _.reduce(
      obj,
      (result, value, key) => {
        const camelKey = _.camelCase(key);
        result[camelKey] = snakeToCamelCaseKeys(value);
        return result;
      },
      {},
    );
  }
  return obj;
}

@Controller('tv')
export class TvShowsController {
  constructor(
    private readonly tvShowsService: TvShowsService,
    private readonly tmdbApiService: TmdbApiService,
  ) {}

  @Post()
  async create(@Body(ValidationPipe) createTvShowDto: CreateTvShowDto) {
    const tvShow = await this.tvShowsService.create(createTvShowDto);

    // Transform entity to response DTO
    return plainToClass(TvShowsResponseDto, tvShow, {
      excludeExtraneousValues: true,
    });
  }

  // Debugging 
  @Get('injectData')
  async injectTrendingShowPages(@Query('page') page: string = '1') {
    try {
      const start = Date.now();
      const pages = page.split(',');
      for (const p of pages) {
        await this.tvShowsService.injectTrendingShowsPage(parseInt(p));
      }
      return {
        message: 'Data injected successfully',
        totalTime: Date.now() - start,
        timeCompleted: new Date(),
      };
    } catch (error) {
      console.error('Error injecting data:', error);
      return { error: 'Failed to inject data' };
    }
  }

  @Get(':id/season/:seasonNumber')
  async findSeason(
    @Param('id', ParseIntPipe) id: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
  ) {
    // console.log('hitting season');
    let season = await this.tvShowsService.findDetailedSeason(id, seasonNumber);

    if (!season) {
      // If not found in DB, get the info from the TMDB API

      try {
        season = await this.tmdbApiService.getSeasonResponse(id, seasonNumber);
        season = camelize(season); // convert snake_case to camelCase for dto Transform
      } catch /* (error)*/ {
        throw new NotFoundException(
          `Season not found for id ${id} and season number ${seasonNumber}`,
        );
      }
      if (!season) {
        throw new NotFoundException(
          `Season not found for id ${id} and season number ${seasonNumber}`,
        );
      }
    }

    const plaintoInstance = plainToInstance(DetailedSeasonResponseDto, season, {
      excludeExtraneousValues: true,
      // nameConversion: (name: string) => snakeCase(name), // Convert camelCase to snake_case for output
      // transformOptions: {}
      // enableImplicitConversion: true,
    });

    return plaintoInstance;
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    let tvShow = await this.tvShowsService.findOne(id);
    // Order the seasons by season_number

    if (!tvShow) {
      try {
        // If not found in DB, get the info from the TMDB API
        tvShow = await this.tmdbApiService.getFullShowResponse(id);
        tvShow = camelize(tvShow); // convert snake_case to camelCase for dto Transform
        if (!tvShow) {
          throw new NotFoundException(`TV Show with ID ${id} not found`);
        }
      } catch (error) {
        console.log('error', error);
        throw new NotFoundException(`TV Show with ID ${id} not found`);
      }
    }

    tvShow.seasons = tvShow.seasons.sort(
      (a, b) => a.seasonNumber - b.seasonNumber,
    );
    // Transform entity to response DTO
    const plaintoInstance = plainToInstance(TVShowResponseDto, tvShow, {
      excludeExtraneousValues: true,
      // enableImplicitConversion: true,
    });

    return plaintoInstance;
  }

  @Get('*')
  async handleOtherRequests(
    @Req() req: Request,
    // @Res() res: Response,
    // @Query() query: any,
    // @Param() params: any,
  ) {
    return this.tmdbApiService.handleOtherRequests(req.url);
  }
}
