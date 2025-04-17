// src/users/entities/user.entity.ts
import { BeforeUpdate, Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Show {
  //   @PrimaryGeneratedColumn('uuid')
  @PrimaryColumn({ unique: true })
  id: string;

  @Column()
  title: string;

  @Column()
  backdropPath: string;

  @Column()
  overview: string;

  @Column()
  name: string;

  @Column()
  posterPath: string;

  @Column()
  mediaType: string;

  @Column()
  adult: boolean;

  @Column()
  originalLanguage: string;

  @Column('decimal', { precision: 10, scale: 4 })
  popularity: number;

  @Column()
  airDate: string;

  @Column()
  originCountry: string; // TODO: Should this be an array that maps to country codes?

  @Column()
  voteCount: number;

  @Column('decimal', { precision: 5, scale: 3 })
  voteAverage: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  modifiedAt: Date;

  @BeforeUpdate()
  updateModifiedAt() {
    this.modifiedAt = new Date();
  }
}
