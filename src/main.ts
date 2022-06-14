import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { configure } from './configure';
import { SERVICE_NAME } from './constants';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  await configure(app);

  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get('app.port', 3000);
  await app.listen(port, '0.0.0.0');

  Logger.log(
    `🚀 Application ${SERVICE_NAME} is running on: ${await app.getUrl()}`,
    'Bootstrap',
  );
}

bootstrap();
