import { Test, TestingModule } from '@nestjs/testing';
import { TmdbApiService } from './tmdb-api.service';

describe('TmdbApiService', () => {
  let service: TmdbApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TmdbApiService],
    }).compile();

    service = module.get<TmdbApiService>(TmdbApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
