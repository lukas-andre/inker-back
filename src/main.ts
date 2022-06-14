import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { configure } from './configure';
import { SERVICE_NAME } from './constants';
import { appConfig } from './config/app.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  await configure(app);

  const appConf: ConfigType<typeof appConfig> = app.get(appConfig.KEY);
  await app.listen(appConf.port, appConf.host);

  Logger.log(
    `🚀 Application ${SERVICE_NAME} is running on: ${await app.getUrl()}`,
    'Bootstrap',
  );
}

bootstrap();
