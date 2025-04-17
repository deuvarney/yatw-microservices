// src/tv-shows/dto/tv-show-response.dto.ts
import { Exclude, Expose, Transform, Type } from 'class-transformer';

class Person {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }) => obj.creditId)
  credit_id: string;

  @Expose()
  gender: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.originalName)
  original_name: number;

  @Expose()
  @Transform(({ obj }) => obj.profilePath)
  profile_path: string;
}

class DetailedPersonDto {
  @Expose()
  id: number;

  @Expose()
  adult: boolean;

  @Expose({ name: 'creditId' })
  credit_id: string;

  @Expose()
  department: string;

  @Expose()
  gender: number;

  @Expose()
  job: string;

  @Expose({ name: 'knownForDepartment' })
  known_for_department: string;

  @Expose()
  name: string;

  @Expose({ name: 'originalName' })
  original_name: string;

  @Expose()
  popularity: number;

  @Expose({ name: 'profilePath' })
  profile_path: string;
}

class GenreDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

class NetworkDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.logoPath)
  logo_path: string;
}

class ProductionCountry {
  @Expose()
  @Transform(({ obj }) => obj.iso31661)
  iso_3166_1: string;

  @Expose()
  name: string;
}

class Language {
  @Expose()
  iso_639_1: string;

  @Expose()
  name: string;

  @Expose()
  english_name: string;
}

export class ProductionCompany {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.logoPath)
  logo_path: string;

  @Expose()
  @Transform(({ obj }) => obj.originCountry?.iso31661 || '')
  origin_country: string;
}

class EpisodeDto {
  @Expose()
  id: number;

  @Expose({ name: 'airDate' })
  air_date?: Date;

  @Expose()
  @Type(() => DetailedPersonDto)
  crew: DetailedPersonDto[];

  @Expose()
  @Transform(({ obj }) => obj.episodeNumber)
  episode_number: string;

  @Expose()
  @Transform(({ obj }) => obj.episodeType)
  episode_type: string;

  @Expose({ name: 'guestStars' })
  @Type(() => DetailedPersonDto)
  guest_stars: DetailedPersonDto[];

  @Expose()
  name: string;

  @Expose()
  overview: string;

  @Expose()
  @Transform(({ obj }) => obj.productionCode)
  production_code: string;

  @Expose()
  runtime: number;

  @Expose()
  @Transform(({ obj }) => obj.seasonNumber)
  season_number: number;

  @Expose()
  @Transform(({ obj }) => obj.showId)
  show_id: number;

  @Expose()
  @Transform(({ obj }) => obj.stillPath)
  still_path: string;

  @Expose()
  @Transform(({ obj }) => parseFloat(obj.voteAverage))
  vote_average: number;

  @Expose()
  @Transform(({ obj }) => obj.voteCount)
  vote_count: number;
}

class SeasonDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }) => obj.airDate)
  air_date?: Date;

  @Expose()
  @Transform(({ obj }) => obj.episodeCount)
  episode_count: number;

  @Expose()
  name: string;

  @Expose()
  overview?: string;

  @Expose()
  @Transform(({ obj }) => obj.posterPath)
  poster_path: string;

  // @Expose()
  // tvShowId: number;

  @Expose()
  @Transform(({ obj }) => obj.seasonNumber)
  season_number: number;

  @Expose()
  @Transform(({ obj }) => parseFloat(obj.voteAverage))
  vote_average: number;

  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => EpisodeDto)
  // episodes?: EpisodeDto[];
}

export class TvShowsResponseDto {
  @Expose()
  id: number;

  @Expose()
  adult: boolean;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.originalName)
  original_name: string;

  @Expose()
  overview: string;

  @Expose()
  @Transform(({ obj }) => obj.firstAirDate)
  first_air_date: string;

  @Expose()
  @Transform(() => 'tv')
  media_type: string;

  @Expose()
  @Transform(({ obj }) => obj.posterPath)
  poster_path: string;

  @Expose()
  @Transform(({ obj }) => obj.backdropPath)
  backdrop_path: string;

  @Expose()
  popularity: number;

  @Expose()
  @Transform(({ obj }) => parseFloat(obj.voteAverage))
  vote_average: number;

  @Expose()
  @Transform(({ obj }) => obj.voteCount)
  vote_count: number;

  @Expose()
  @Transform(({ obj }) => obj.originalLanguage)
  original_language: string;

  @Expose()
  @Transform(({ obj }) => obj.genres.map((genre) => genre.id))
  genre_ids: string[];

  @Expose()
  @Transform(({ obj }) => {
    return obj.originCountry.map((country) => country.iso31661);
  })
  origin_country: string[];
}

export class TVShowResponseDto extends TvShowsResponseDto {
  @Expose({ name: 'createdBy' })
  @Type(() => Person)
  // @Transform(({ obj }) => obj.createdBy)
  created_by: Person[];

  @Expose({ name: 'episodeRunTime' })
  // @Transform(({ obj }) => obj.episodeRunTime)
  episode_run_time: number[];

  @Exclude() // Used by parent class
  genre_ids: string[];

  @Expose()
  languages: string[];

  @Expose()
  @Type(() => GenreDto)
  genres: GenreDto[];

  @Expose()
  homepage: string;

  @Expose({ name: 'inProduction' })
  // @Transform(({ obj }) => obj.inProduction)
  in_production: boolean;

  @Expose({ name: 'lastAirDate' })
  // @Transform(({ obj }) => obj.lastAirDate)
  last_air_date: Date;

  @Expose()
  @Type(() => NetworkDto)
  networks: NetworkDto[];

  @Expose({ name: 'numberOfSeasons' })
  // @Transform(({ obj }) => obj.numberOfSeasons)
  number_of_seasons: number;

  @Expose()
  @Transform(({ obj }) => obj.numberOfEpisodes)
  number_of_episodes: number;

  @Expose({ name: 'productionCompanies' })
  @Type(() => ProductionCompany) // Rename to avoid confusion with entity
  // @Transform(({ obj }) => obj.productionCompanies)
  production_companies: ProductionCompany[];

  @Expose()
  @Type(() => ProductionCountry)
  @Transform(({ obj }) => obj.productionCountries)
  production_countries: ProductionCountry[];

  @Expose()
  @Type(() => Language)
  @Transform(({ obj }) => obj.spokenLanguages)
  spoken_languages: Language[];

  @Expose()
  status: string;

  @Expose()
  type: string;

  @Expose()
  tagline: string;

  @Expose()
  @Type(() => SeasonDto)
  seasons: SeasonDto[];
}

export class DetailedSeasonResponseDto extends SeasonDto {
  @Exclude()
  episode_count: number;

  @Expose()
  @Type(() => EpisodeDto)
  episodes: EpisodeDto[];
}
