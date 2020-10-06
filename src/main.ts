import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as csurf from 'csurf';
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // TODO: Crear un logger
    cors: {
      origin: true,
      preflightContinue: false,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // TODO: Ver si usar global filters
  const configService: ConfigService = app.get(ConfigService);

  const options = new DocumentBuilder()
    .setTitle('Inker Backend Service')
    .setDescription('Backend manager for Inker')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.use(helmet());
  app.use(csurf());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  const port = configService.get('app.port', 3000);

  await app.listen(port);
}
bootstrap();
