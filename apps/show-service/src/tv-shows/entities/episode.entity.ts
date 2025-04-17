// src/entities/episode.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Season } from './season.entity';
import { TvShow } from './tv-show.entity';
// import { Person } from './person.entity';
import { DetailedPerson } from './detailed-person.entity';

@Entity('episodes')
@Unique(['seasonId', 'episodeNumber'])
export class Episode {
  @PrimaryColumn()
  id: number;

  @Column()
  seasonId: number;

  @Column()
  showId: number;

  @Column()
  episodeNumber: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ type: 'date', nullable: true })
  airDate: Date;

  @Column({ nullable: true })
  runtime: number;

  @Column({ nullable: true })
  stillPath: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  voteAverage: number;

  @Column({ nullable: true })
  voteCount: number;

  @Column({ nullable: true })
  productionCode: string;

  @Column({ nullable: true })
  episodeType: string;

  // // JSONB fields for complex nested data
  // @Column({ type: 'jsonb', nullable: true })
  // crew: any[];
  @ManyToMany(() => DetailedPerson)
  @JoinTable({
    name: 'episodes_crew',
    joinColumn: { name: 'episode_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'person_id', referencedColumnName: 'id' },
  })
  crew: DetailedPerson[];

  // @Column({ type: 'jsonb', nullable: true })
  // guestStars: any[];
  @ManyToMany(() => DetailedPerson)
  @JoinTable({
    name: 'episodes_guest_stars',
    joinColumn: { name: 'episode_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'person_id', referencedColumnName: 'id' },
  })
  guestStars: DetailedPerson[];

  @ManyToOne(() => Season, (season) => season.episodes)
  @JoinColumn({ name: 'seasonId' })
  season: Season;

  @ManyToOne(() => TvShow)
  @JoinColumn({ name: 'tv_show_id' })
  tvShow: TvShow;
}
