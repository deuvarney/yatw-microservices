// src/entities/country.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryColumn({ length: 2 })
  iso31661: string;

  @Column()
  name: string;
}
