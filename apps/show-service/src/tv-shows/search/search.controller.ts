import { Controller, Get, Req } from '@nestjs/common';
import { TmdbApiService } from '../tmdb-api/tmdb-api.service';

@Controller('search')
export class SearchController {
  constructor(private readonly tmdbApiService: TmdbApiService) {}
  @Get('*')
  async handleOtherRequests(
    @Req() req: Request,
    // @Res() res: Response,
    // @Query() query: any,
    // @Param() params: any,
  ) {
    return this.tmdbApiService.handleOtherRequests(req.url);
  }
}
