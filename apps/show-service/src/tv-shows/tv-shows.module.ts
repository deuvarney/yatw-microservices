// src/tv-shows/tv-shows.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TvShowsController } from './tv-shows.controller';
import { TvShowsService } from './tv-shows.service';
import { SeasonsService } from './seasons.service';
import { TvShow } from './entities/tv-show.entity';
import { Season } from './entities/season.entity';
import { Episode } from './entities/episode.entity';
import { Genre } from './entities/genre.entity';
import { Network } from './entities/network.entity';
import { Person } from './entities/person.entity';
import { ProductionCompany } from './entities/production-company.entity';
import { Country } from './entities/country.entity';
import { Language } from './entities/language.entity';
import { DetailedPerson } from './entities/detailed-person.entity';
import { TrendingShows } from './entities/trending.entity';
import { TMDBApiModule } from './tmdb-api/tmdb-api.module';
import { TrendingController } from './trending/trending.controller';
import { SearchService } from './search/search.service';
import { SearchController } from './search/search.controller';
import { RedisModule } from 'src/redis/redis.module';
import { PopularShows } from './entities/popular.entity';
import { PopularController } from './popular/popular.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TvShow,
      Season,
      Country,
      Episode,
      Genre,
      Network,
      DetailedPerson,
      Person,
      ProductionCompany,
      Language,
      TrendingShows,
      PopularShows
    ]),
    TMDBApiModule,
    RedisModule,
  ],
  controllers: [
    PopularController,
    TvShowsController,
    TrendingController,
    SearchController
  ],
  providers: [
    TvShowsService,
    SeasonsService,
    SearchService
  ],
})
export class TvShowsModule { }
