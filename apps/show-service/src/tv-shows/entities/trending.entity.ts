import { Column, Entity, PrimaryColumn } from "typeorm";

export enum ShowCacheStatus {
  CACHED = 'cached',
  STALE = 'stale',
  EXPIRED = 'expired',
  INVALID = 'invalid',
  VALIDATING = 'validating',
  UPDATING = 'updating',
}

@Entity('trending_shows')
export class TrendingShows {
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