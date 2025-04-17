// src/entities/genre.entity.ts
import { Entity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import { TvShow } from './tv-show.entity';

@Entity('genres')
export class Genre {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => TvShow, (tvShow) => tvShow.genres)
  tvShows: TvShow[];
}
