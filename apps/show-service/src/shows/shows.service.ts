// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Show } from './entities/show.entity';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show)
    private showsRepository: Repository<Show>,
  ) {}

  findAll(): Promise<Show[]> {
    return this.showsRepository.find();
  }

  findOne(id: string): Promise<Show> {
    return this.showsRepository.findOne({ where: { id } });
  }

  async create(showData: Partial<Show>): Promise<Show> {
    const show = this.showsRepository.create(showData);
    return this.showsRepository.save(show);
  }

  async update(id: string, showData: Partial<Show>): Promise<Show> {
    await this.showsRepository.update(id, showData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.showsRepository.delete(id);
  }

  async injectShow(): Promise<void> {
    const showsResponse = await fetch(
      'https://api.themoviedb.org/3/trending/tv/day?api_key=9b036259d38fe5e4eddd383b00877ee7&page=2&media_type=tv&time_window=day&languagxe=en-US',
    );
    const showsData = await showsResponse.json();

    for (const show of showsData.results) {
      const existingShow = await this.findOne(show.id.toString());
      if (!existingShow) {
        await this.create({
          id: show.id.toString(),
          title: show.name,
          backdropPath: show.backdrop_path,
          overview: show.overview,
          name: show.name,
          posterPath: show.poster_path,
          mediaType: show.media_type,
          adult: show.adult,
          originalLanguage: show.original_language,
          popularity: show.popularity,
          airDate: show.first_air_date,
          originCountry: show.origin_country,
          voteCount: show.vote_count,
          voteAverage: show.vote_average,
        });
      }
    }
  }
}
