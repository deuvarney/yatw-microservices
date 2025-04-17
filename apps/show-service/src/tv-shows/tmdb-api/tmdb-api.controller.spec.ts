import { Test, TestingModule } from '@nestjs/testing';
import { TmdbApiController } from './tmdb-api.controller';

describe('TmdbApiController', () => {
  let controller: TmdbApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TmdbApiController],
    }).compile();

    controller = module.get<TmdbApiController>(TmdbApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
