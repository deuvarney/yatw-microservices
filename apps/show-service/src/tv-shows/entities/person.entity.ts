// src/entities/person.entity.ts
import { Entity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import { TvShow } from './tv-show.entity';
import { Episode } from './episode.entity';

@Entity('people')
export class Person {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int', nullable: true })
  gender: number;

  @Column({ nullable: true })
  profilePath: string;

  @Column({ nullable: true })
  knownForDepartment: string;

  @ManyToMany(() => TvShow, (tvShow) => tvShow.createdBy)
  createdShows: TvShow[];

  @ManyToMany(() => Episode, (episode) => episode.crew)
  crewForEpisodes: Episode[];

  @ManyToMany(() => Episode, (episode) => episode.guestStars)
  guestStarInEpisodes: Episode[];
}
