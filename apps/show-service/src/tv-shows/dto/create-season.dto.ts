// src/tv-shows/dto/create-season.dto.ts
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EpisodeDto } from './create-tv-show.dto';

export class CreateSeasonDto {
  @IsNumber()
  id: number;

  @IsNumber()
  tvShowId: number;

  @IsNumber()
  seasonNumber: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  airDate?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EpisodeDto)
  episodes?: EpisodeDto[];
}
