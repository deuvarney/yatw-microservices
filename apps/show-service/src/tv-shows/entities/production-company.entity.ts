// src/entities/production-company.entity.ts
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

@Entity('production_companies')
export class ProductionCompany {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  logoPath: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'origin_country', referencedColumnName: 'iso31661' })
  originCountry: Country;

  @ManyToMany(() => TvShow, (tvShow) => tvShow.productionCompanies)
  tvShows: TvShow[];
}
