// // src/tv-shows/dto/create-tv-show.dto.ts
// import {
//   IsString,
//   IsNumber,
//   IsOptional,
//   IsBoolean,
//   IsDate,
//   IsArray,
//   ValidateNested,
// } from 'class-validator';
// import { Type } from 'class-transformer';

// class GenreDto {
//   @IsNumber()
//   id: number;

//   @IsString()
//   name: string;
// }

// class NetworkDto {
//   @IsNumber()
//   id: number;

//   @IsString()
//   name: string;

//   @IsOptional()
//   @IsString()
//   logoPath?: string;

//   @IsOptional()
//   @IsString()
//   originCountry?: string;
// }

// export class CreateTvShowDto {
//   @IsNumber()
//   id: number;

//   @IsString()
//   name: string;

//   @IsOptional()
//   @IsString()
//   originalName?: string;

//   @IsOptional()
//   @IsString()
//   overview?: string;

//   @IsOptional()
//   @IsDate()
//   @Type(() => Date)
//   firstAirDate?: Date;

//   @IsOptional()
//   @IsBoolean()
//   adult?: boolean;

//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => GenreDto)
//   genres?: GenreDto[];

//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => NetworkDto)
//   networks?: NetworkDto[];
// }

// src/tv-shows/dto/create-tv-show.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
  ValidateNested,
  IsUrl,
  IsDecimal,
  IsInt,
  Min,
  MaxLength,
  // isNumber,
  // isNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CountryDto {
  @IsString()
  iso_3166_1: string;

  @IsString()
  name: string;
}

export class GenreDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;
}

export class NetworkDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logoPath?: string;

  @IsOptional()
  @IsString()
  originCountry?: string;
}

export class PersonDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  gender?: number;

  @IsOptional()
  @IsString()
  profilePath?: string;

  @IsOptional()
  @IsString()
  knownForDepartment?: string;
}

export class DetailedPersonDto {
  @IsNumber()
  id: number;

  @IsBoolean()
  adult: boolean;

  @IsOptional()
  @IsString()
  creditId: string;

  @IsOptional()
  @IsString()
  department: string;

  @IsNumber()
  gender: number;

  @IsString()
  job: string;

  @IsOptional()
  @IsString()
  knownForDepartment?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  originalName?: string;

  @IsOptional()
  @IsDecimal()
  popularity?: number;

  @IsOptional()
  @IsString()
  profilePath?: string;
}

export class ProductionCompanyDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logoPath?: string;

  @IsOptional()
  @IsString()
  originCountry?: string;
}

export class EpisodeDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  airDate?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailedPersonDto)
  crew?: DetailedPersonDto[];

  @IsNumber()
  episodeNumber: number;

  @IsOptional()
  @IsString()
  episodeType?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailedPersonDto)
  guestStars?: DetailedPersonDto[];

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsString()
  productionCode?: string;

  @IsOptional()
  @IsNumber()
  runtime?: number;

  @IsNumber()
  seasonNumber: number;

  @IsNumber()
  showId: number;

  @IsOptional()
  @IsString()
  stillPath?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,3' })
  voteAverage?: number;

  @IsOptional()
  @IsNumber()
  voteCount?: number;

  @IsNumber()
  seasonId: number;
}

export class SeasonDto {
  @IsNumber()
  id: number;

  @IsNumber()
  seasonNumber: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  airDate?: Date;

  @IsOptional()
  @IsNumber()
  episodeCount?: number;

  @IsOptional()
  @IsString()
  posterPath?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,3' })
  voteAverage?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EpisodeDto)
  episodes?: EpisodeDto[];
}

export class LanguageDto {
  @IsString()
  iso_639_1: string;

  @IsString()
  name: string;

  @IsString()
  english_name: string;
}

export class CreateTvShowDto {
  @IsNumber()
  id: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalName?: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsArray()
  episodeRunTime?: number[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  firstAirDate?: Date;

  @IsOptional()
  @IsArray()
  languages?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastAirDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  posterPath?: string;

  @IsOptional()
  @IsString()
  backdropPath?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  popularity?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,3' })
  voteAverage?: number;

  @IsOptional()
  @IsInt()
  voteCount?: number;

  @IsOptional()
  @IsBoolean()
  inProduction?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfEpisodes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfSeasons?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  originalLanguage?: string;

  @IsOptional()
  @IsUrl()
  homepage?: string;

  @IsOptional()
  @IsBoolean()
  adult?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenreDto)
  genres?: GenreDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NetworkDto)
  networks?: NetworkDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonDto)
  createdBy?: PersonDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryDto)
  productionCountries?: CountryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryDto)
  originCountry?: CountryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionCompanyDto)
  productionCompanies?: ProductionCompanyDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeasonDto)
  seasons?: SeasonDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  spokenLanguages?: LanguageDto[];
}

