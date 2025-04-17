import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrendingResponse } from 'moviedb-promise';

@Injectable()
export class TmdbApiService {
  private readonly TMDB_API_KEY;

  private readonly TMDB_API_PREFIX;

  constructor(private readonly configService: ConfigService) {
    this.TMDB_API_KEY = this.configService.get('TMDB_API_KEY');
    this.TMDB_API_PREFIX = this.configService.get('TMDB_API_PREFIX');
  }

  private buildAndExecuteAPIUrl(path: string): Promise<any> {
    // Get the params from the path and add/override an api_key parameter
    const params = new URLSearchParams(path.split('?')[1]);
    params.set('api_key', this.TMDB_API_KEY);
    path = `${path.split('?')[0]}?${params.toString()}`;

    return fetch(`${this.TMDB_API_PREFIX}${path}`).then((r) => r.json());
  }

  // TODO: Add types for the response
  getFullShowResponse(showId: number): Promise<any> {
    const path = `/tv/${showId}`;
    return this.buildAndExecuteAPIUrl(path);
  }

  // TODO: Add types for the response
  getSeasonResponse(showId: number, seasonNumber: number): Promise<any> {
    const path = `/tv/${showId}/season/${seasonNumber}`;
    return this.buildAndExecuteAPIUrl(path);
  }

  getTrendingTvShows(page = 1): Promise<TrendingResponse> {
    const path = `/trending/tv/day?page=${page}&media_type=tv&time_window=day&languagxe=en-US`;
    return this.buildAndExecuteAPIUrl(path);
  }

  handleOtherRequests(path) {
    return this.buildAndExecuteAPIUrl(path);
  }
}
