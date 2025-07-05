import otelSDK from './tracing';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { configure } from './configure';
import { SERVICE_NAME } from './constants';

// test
async function bootstrap() {
  // Start OpenTelemetry SDK before creating the NestJS  application
  otelSDK.start();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
      snapshot: true,
    },
  );

  // Use Pino logger
  app.useLogger(app.get(Logger));

  await configure(app);

  const appConf: ConfigType<typeof appConfig> = app.get(appConfig.KEY);
  const logger = app.get(Logger);
  
  await app.listen(appConf.port, appConf.host);

  const appUrl = await app.getUrl();

  logger.log(
    `🚀 Application ${SERVICE_NAME} is running on: ${appUrl}`,
    'Bootstrap',
  );
  logger.log(
    `🚀 Application ${SERVICE_NAME} OAS is running on: ${appUrl}/oas`,
    'Bootstrap',
  );
  logger.log(
    `📊 Prometheus metrics available at: http://localhost:8081/metrics`,
    'Bootstrap',
  );
}

bootstrap();
