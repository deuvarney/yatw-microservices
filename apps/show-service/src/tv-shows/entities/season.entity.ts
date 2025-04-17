// src/entities/season.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  // PrimaryGeneratedColumn,
} from 'typeorm';
import { TvShow } from './tv-show.entity';
import { Episode } from './episode.entity';

@Entity('seasons')
@Unique(['tvShowId', 'seasonNumber'])
export class Season {
  @PrimaryColumn()
  // @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  tvShowId: number;

  @Column()
  seasonNumber: number;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ type: 'date', nullable: true })
  airDate: Date;

  @Column({ nullable: true })
  episodeCount: number;

  @Column({ nullable: true })
  posterPath: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  voteAverage: number;

  @ManyToOne(() => TvShow, (tvShow) => tvShow.seasons)
  @JoinColumn({ name: 'tv_show_id' })
  tvShow: TvShow;

  @OneToMany(() => Episode, (episode) => episode.season)
  episodes: Episode[];
}
