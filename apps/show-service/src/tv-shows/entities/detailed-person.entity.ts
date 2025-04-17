// src/entities/detailed-person.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  //   ManyToOne,
  //   JoinColumn,
  //   Unique,
  //   JoinTable,
  //   ManyToMany,
} from 'typeorm';

@Entity('detailed-person')
export class DetailedPerson {
  @PrimaryColumn()
  id: number;

  @Column({ default: false })
  adult: boolean;

  @Column()
  creditId: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'int', nullable: true })
  gender: number;

  @Column({ nullable: true })
  job: string;

  @Column({ nullable: true })
  knownForDepartment: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  originalName: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  popularity: number;

  @Column({ nullable: true })
  profilePath: string;
}

// adult
// :
// false
// credit_id
// :
// "550d7536c3a3684883005ba0"
// department
// :
// "Directing"
// gender
// :
// 2
// id
// :
// 1216417
// job
// :
// "Director"
// known_for_department
// :
// "Directing"
// name
// :
// "Euros Lyn"
// original_name
// :
// "Euros Lyn"
// popularity
// :
// 0.2259
// profile_path
// :
// "/4LyC3RsMQvtdchqYKZes3W0iHX.jpg"
// }
