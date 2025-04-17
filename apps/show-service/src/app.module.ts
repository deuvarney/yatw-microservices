import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ShowsModule } from './shows/shows.module';
import { TvShowsModule } from './tv-shows/tv-shows.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ShowsModule,
    TvShowsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
