import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('languages')
export class Language {
  @PrimaryColumn({ length: 2 })
  iso_639_1: string;

  @Column()
  english_name: string;

  @Column()
  name: string;
}
