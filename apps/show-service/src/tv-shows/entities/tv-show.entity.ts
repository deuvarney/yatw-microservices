// src/entities/tv-show.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Season } from './season.entity';
import { Genre } from './genre.entity';
import { Network } from './network.entity';
import { Person } from './person.entity';
import { ProductionCompany } from './production-company.entity';
import { Country } from './country.entity';
import { Language } from './language.entity';

// Define a transformer class
class NumericDecimalTransformer {
  to(data: number): number {
    return data;
  }

  from(data: string): number {
    return parseFloat(data);
  }
}

@Entity('tv_shows')
export class TvShow {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  originalName: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ type: 'date', nullable: true })
  firstAirDate: Date;

  @Column({ type: 'date', nullable: true })
  lastAirDate: Date;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  tagline: string;

  @Column({ nullable: true })
  posterPath: string;

  @Column({ nullable: true })
  backdropPath: string;

  @Column('int', { array: true, nullable: true }) // PostgreSQL only
  episodeRunTime: number[];

  @Column('varchar', { array: true, nullable: true })
  languages: string[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    transformer: new NumericDecimalTransformer(),
  })
  popularity: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 3,
    nullable: true,
    transformer: new NumericDecimalTransformer(),
  })
  voteAverage: number;

  @Column({ nullable: true })
  voteCount: number;

  @Column({ default: false })
  inProduction: boolean;

  @Column({ nullable: true })
  numberOfEpisodes: number;

  @Column({ nullable: true })
  numberOfSeasons: number;

  @Column({ length: 10, nullable: true })
  originalLanguage: string;

  @Column({ nullable: true })
  homepage: string;

  @Column({ default: false })
  adult: boolean;

  @OneToMany(() => Season, (season) => season.tvShow)
  seasons: Season[];

  @ManyToMany(() => Genre)
  @JoinTable({
    name: 'tv_show_genres',
    joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];

  @ManyToMany(() => Network)
  @JoinTable({
    name: 'tv_show_networks',
    joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'network_id', referencedColumnName: 'id' },
  })
  networks: Network[];

  @ManyToMany(() => Person)
  @JoinTable({
    name: 'tv_show_creators',
    joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'person_id', referencedColumnName: 'id' },
  })
  createdBy: Person[];

  @ManyToMany(() => ProductionCompany)
  @JoinTable({
    name: 'tv_show_production_companies',
    joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'company_id', referencedColumnName: 'id' },
  })
  productionCompanies: ProductionCompany[];

  // @ManyToOne(() => Country, (country) => country.iso31661)
  // productionCountries: Country[];
  // src/entities/tv-show.entity.ts
  @ManyToMany(() => Country)
  @JoinTable({
    name: 'tv_show_production_countries',
    joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'country_code',
      referencedColumnName: 'iso31661',
    },
  })
  productionCountries: Country[];

  // TODO: Look if this is doing the same query twice, if so, just reuse the productionCountries when generating the result
  @ManyToMany(() => Country)
  @JoinTable({
    name: 'tv_show_production_countries',
    joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'country_code',
      referencedColumnName: 'iso31661',
    },
  })
  originCountry: Country[];

  @ManyToMany(() => Language)
  @JoinTable({
    name: 'tv_show_languages',
    joinColumn: {
      name: 'tv_show_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'language_code',
      referencedColumnName: 'iso_639_1',
    },
  })
  spokenLanguages: Language[];

  // Virtual property that uses the same data
  // @Expose()
  // get originCountry(): Country[] {
  //   return this.productionCountries;
  // }
  // originCountry: Country[];

  // @AfterLoad()
  // setOriginCountry() {
  //   if (this.productionCountries) {
  //     this.originCountry = this.productionCountries;
  //   }
  // }
}
