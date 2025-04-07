import fs from 'fs';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import stringify from 'fast-safe-stringify';
import multipart from '@fastify/multipart';

import { oasConfig } from './config/oas.config';
import { corsOptions, validationPipeOptions } from './constants';
import { AllExceptionsFilter } from './global/infrastructure/exception-filters/all-exception.filter';

const configureOAS = async (app: NestFastifyApplication) => {
  const oasConf: ConfigType<typeof oasConfig> = app.get(oasConfig.KEY);
  if (oasConf.enabled) {
    const config = new DocumentBuilder()
      .setTitle('Inker Backend API')
      .setDescription('Backend manager for Inker')
      .setVersion('0.1')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'bearer',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    try {
      fs.writeFileSync('./postman/schemas/oas.json', stringify(document));
    } catch (error) {
      Logger.error(error);
    }
    SwaggerModule.setup(oasConf.path, app, document);

    Logger.log(
      `📖 Open API Specification is enabled under /${oasConf.path} path`,
      'OpenAPISpecification',
    );
  } else {
    Logger.log(`📖 Open API Specification is disabled`, 'OpenAPISpecification');
  }
};

export const configure = async (app: NestFastifyApplication) => {
  app.enableCors(corsOptions);

  // await app.register(helmet, helmetOptions);
  // TODO: USE THROTTLE MIDDLEWARE https://docs.nestjs.com/security/rate-limiting#rate-limiting
  // await app.register(rateLimit, rateLimitOptions);

  await app.register(multipart);

  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  await configureOAS(app);

  app.enableShutdownHooks();
};
