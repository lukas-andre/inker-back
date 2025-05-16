import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { ClsModule } from 'nestjs-cls';

import { appConfigSchema } from '../config/app.config';
import { authConfigSchema } from '../config/auth.config';
import { AWSConfigSchema } from '../config/aws.config';
import { config } from '../config/config';
import { databaseConfigSchema } from '../config/database/config';
import { oasConfigSchema } from '../config/oas.config';
import { runwareConfigSchema } from '../config/runware.config';
import { sendGridSchema } from '../config/sendgrid.config';
import { verificationHashConfigSchema } from '../config/verificationHash';

import { BaseHandler } from './infrastructure/base.handler';
import { S3Client } from './infrastructure/clients/s3.client';
import { SMSClient } from './infrastructure/clients/sms.client';
import { RequestContextService } from './infrastructure/services/requestContext.service';
import { UniqueIdService } from './infrastructure/services/uniqueId.service';
import { DomainEventsService } from './domain/events/domainEvents.service';

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
        .concat(databaseConfigSchema)
        .concat(sendGridSchema)
        .concat(runwareConfigSchema),
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
  providers: [BaseHandler, S3Client, SMSClient, RequestContextService, UniqueIdService, DomainEventsService],
  exports: [
    ConfigModule,
    S3Client,
    SMSClient,
    JwtModule,
    RequestContextService,
    UniqueIdService,
    DomainEventsService
  ],
})
export class GlobalModule {
  constructor(private readonly configService: ConfigService) {}
}
