// src/entities/network.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Country } from './country.entity';
import { TvShow } from './tv-show.entity';
import { Optional } from '@nestjs/common';

@Entity('networks')
export class Network {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  logoPath: string;

  // @Column({ nullable: true })
  // originCountry: string;

  @Optional()
  @ManyToOne(() => Country)
  @JoinColumn({ name: 'origin_country', referencedColumnName: 'iso31661' })
  country?: Country;

  @ManyToMany(() => TvShow, (tvShow) => tvShow.networks)
  tvShows: TvShow[];
}
