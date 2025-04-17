import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';
import { ShowsService } from './shows.service';
import { ShowsController } from './shows.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Show])],
  providers: [ShowsService],
  controllers: [ShowsController],
})
export class ShowsModule {}
