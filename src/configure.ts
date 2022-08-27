import rateLimit from '@fastify/rate-limit';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { oasConfig } from './config/oas.config';
import {
  corsOptions,
  rateLimitOptions,
  validationPipeOptions,
} from './constants';
import { AllExceptionsFilter } from './global/infrastructure/exception-filters/all-exception.filter';

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

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // await app.register(require('@fastify/multipart'), {
  //   limits: {
  //     fieldNameSize: 100, // Max field name size in bytes
  //     fieldSize: 100, // Max field value size in bytes
  //     fields: 10, // Max number of non-file fields
  //     fileSize: 1000000, // For multipart forms, the max file size in bytes
  //     files: 1, // Max number of file fields
  //     headerPairs: 2000, // Max number of header key=>value pairs
  //   },
  // });
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  await configureOAS(app);

  app.enableShutdownHooks();
};
