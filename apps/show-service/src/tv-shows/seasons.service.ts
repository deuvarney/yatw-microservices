// src/tv-shows/seasons.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from './entities/season.entity';
import { Episode } from './entities/episode.entity';
import { TvShow } from './entities/tv-show.entity';
import { CreateSeasonDto } from './dto/create-season.dto';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
    @InjectRepository(TvShow)
    private tvShowRepository: Repository<TvShow>,
  ) {}

  async create(createSeasonDto: CreateSeasonDto): Promise<Season> {
    // First check if TV show exists
    const tvShow = await this.tvShowRepository.findOne({
      where: { id: createSeasonDto.tvShowId },
    });
    if (!tvShow) {
      throw new NotFoundException(
        `TV Show with ID ${createSeasonDto.tvShowId} not found`,
      );
    }

    // Create season entity
    const season = new Season();
    Object.assign(season, {
      id: createSeasonDto.id,
      tvShowId: createSeasonDto.tvShowId,
      seasonNumber: createSeasonDto.seasonNumber,
      name: createSeasonDto.name,
      overview: createSeasonDto.overview,
      airDate: createSeasonDto.airDate,
    });

    // Save season first
    const savedSeason = await this.seasonRepository.save(season);

    // Create episodes if provided
    if (createSeasonDto.episodes && createSeasonDto.episodes.length) {
      const episodes = createSeasonDto.episodes.map((episodeDto) => {
        const episode = new Episode();
        Object.assign(episode, {
          id: episodeDto.id,
          seasonId: savedSeason.id,
          tvShowId: createSeasonDto.tvShowId,
          episodeNumber: episodeDto.episodeNumber,
          name: episodeDto.name,
          overview: episodeDto.overview,
          airDate: episodeDto.airDate,
        });
        return episode;
      });

      await this.episodeRepository.save(episodes);
    }

    // Return complete season with episodes
    // return this.seasonRepository.findOne(savedSeason.id, {
    //   relations: ['episodes'],
    // });
    return this.seasonRepository.findOne({
      where: { id: savedSeason.id },
      relations: ['episodes'],
    });
  }
}
