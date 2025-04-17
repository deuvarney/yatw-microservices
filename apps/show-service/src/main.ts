// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

// src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.TCP,
  //     options: {
  //       host: '0.0.0.0',
  //       port: 3005,
  //     },
  //   },
  // );
  // await app.listen();

  const appz = await NestFactory.create(AppModule);

  appz.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:8080'], // add more hosts as needed
  });

  // appz.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.TCP,
  //   options: {
  //     host: '0.0.0.0',
  //     port: 3005,
  //   },
  // });
  // await appz.startAllMicroservices();
  // console.log('App Started MicroServices');

  await appz.listen(process.env.PORT ?? 3006);
  console.log('App Started listening Port');
}

bootstrap();
