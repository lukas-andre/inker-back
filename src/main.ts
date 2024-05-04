import { Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { configure } from './configure';
import { SERVICE_NAME } from './constants';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
      snapshot: true,
    },
  );

  await configure(app);

  const appConf: ConfigType<typeof appConfig> = app.get(appConfig.KEY);
  await app.listen(appConf.port, appConf.host);

  const appUrl = await app.getUrl();

  Logger.log(
    `🚀 Application ${SERVICE_NAME} is running on: ${appUrl}`,
    'Bootstrap',
  );
  Logger.log(
    `🚀 Application ${SERVICE_NAME} OAS is running on: ${appUrl}/oas`,
    'Bootstrap',
  );
}

bootstrap();
