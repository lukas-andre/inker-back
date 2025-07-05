import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { ClsModule } from 'nestjs-cls';

import { appConfigSchema } from '../config/app.config';
import { authConfigSchema } from '../config/auth.config';
import { AWSConfigSchema } from '../config/aws.config';
import { cloudflareConfigSchema } from '../config/cloudflare.config';
import { config } from '../config/config';
import { databaseConfigSchema } from '../config/database/config';
import { oasConfigSchema } from '../config/oas.config';
import { otelConfigSchema } from '../config/otel.config';
import { PlacesConfigSchema } from '../config/places.config';
import { runwareConfigSchema } from '../config/runware.config';
import { sendGridSchema } from '../config/sendgrid.config';
import { verificationHashConfigSchema } from '../config/verificationHash';

import { DomainEventsService } from './domain/events/domainEvents.service';
import { BaseHandler } from './infrastructure/base.handler';
import { CloudflareImagesClient } from './infrastructure/clients/cloudflare-images.client';
import { S3Client } from './infrastructure/clients/s3.client';
import { SMSClient } from './infrastructure/clients/sms.client';
import { RequestContextService } from './infrastructure/services/requestContext.service';
import { UniqueIdService } from './infrastructure/services/uniqueId.service';

@Global()
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      validationSchema: Joi.object()
        .concat(appConfigSchema)
        .concat(authConfigSchema)
        .concat(oasConfigSchema)
        .concat(verificationHashConfigSchema)
        .concat(AWSConfigSchema)
        .concat(cloudflareConfigSchema)
        .concat(databaseConfigSchema)
        .concat(sendGridSchema)
        .concat(PlacesConfigSchema)
        .concat(runwareConfigSchema)
        .concat(otelConfigSchema),
    }),
    ClsModule.forRoot({
      global: true,
      guard: { mount: true },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('auth.jwtSecretKey'),
        signOptions: {
          expiresIn: config.get('auth.jwtExpiration'),
        },
      }),
    }),
  ],
  controllers: [],
  providers: [
    BaseHandler,
    CloudflareImagesClient,
    S3Client,
    SMSClient,
    RequestContextService,
    UniqueIdService,
    DomainEventsService,
  ],
  exports: [
    ConfigModule,
    CloudflareImagesClient,
    S3Client,
    SMSClient,
    JwtModule,
    RequestContextService,
    UniqueIdService,
    DomainEventsService,
  ],
})
export class GlobalModule {
  constructor(private readonly configService: ConfigService) {}
}
