import { Column, Entity, PrimaryColumn } from "typeorm";
import { ShowCacheStatus } from "./trending.entity";

@Entity('popular_shows')
export class PopularShows {
  @PrimaryColumn()
  id: number;

  @Column()
  page: number;

  @Column()
  lastUpdatedDate: string; // TODO: Should be date string

  @Column()
  cacheStatus: ShowCacheStatus;

  @Column()
  count: number

  @Column('int', { array: true })
  showsIds: number[]

}