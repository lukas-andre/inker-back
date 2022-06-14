import rateLimit from '@fastify/rate-limit';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'fastify-helmet';
import { join } from 'path';
import { oasConfig } from './config/oas.config';
import {
  corsOptions,
  helmetOptions,
  rateLimitOptions,
  validationPipeOptions,
} from './constants';

const configureOAS = async (app: NestFastifyApplication) => {
  const oasConf: ConfigType<typeof oasConfig> = app.get(oasConfig.KEY);
  if (oasConf.enabled) {
    const config = new DocumentBuilder()
      .setTitle('Inker Backend Service')
      .setDescription('Backend manager for Inker')
      .setVersion('0.1')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'bearer',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(oasConf.path, app, document);

    Logger.log(
      `📖 Open API Specification is enabled under /${oasConf.path} path`,
      'Configure',
    );
  } else {
    Logger.log(`📖 Open API Specification is disabled`, 'Configure');
  }
};

export const configure = async (app: NestFastifyApplication) => {
  app.enableCors(corsOptions);

  // await app.register(helmet, helmetOptions);
  await app.register(rateLimit, rateLimitOptions);

  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

  await configureOAS(app);

  app.enableShutdownHooks();
};
