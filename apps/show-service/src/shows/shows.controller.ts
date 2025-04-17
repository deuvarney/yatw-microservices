import { Controller, Get } from '@nestjs/common';
import { ShowsService } from './shows.service';

@Controller('shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Get()
  getHello(): string {
    this.showsService.injectShow();
    return 'Hello World!';
  }
}
