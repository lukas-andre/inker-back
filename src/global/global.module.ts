import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { ClsModule } from 'nestjs-cls';

import { appConfigSchema } from '../config/app.config';
import { authConfigSchema } from '../config/auth.config';
import { AWSConfigSchema } from '../config/aws.config';
import { config } from '../config/config';
import { databaseConfigSchema } from '../config/database/config';
import { oasConfigSchema } from '../config/oas.config';
import { sendGridSchema } from '../config/sendgrid.config';
import { verificationHashConfigSchema } from '../config/verificationHash';

import { RequestInterceptor } from './aspects/request.interceptor';
import { BaseHandler } from './infrastructure/base.handler';
import { S3Client } from './infrastructure/clients/s3.client';
import { SMSClient } from './infrastructure/clients/sms.client';
import { RequestContextService } from './infrastructure/services/requestContext.service';

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
        .concat(sendGridSchema),
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
    S3Client,
    SMSClient,
    RequestContextService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
  exports: [
    ConfigModule,
    S3Client,
    SMSClient,
    JwtModule,
    RequestContextService,
  ],
})
export class GlobalModule {
  constructor(private readonly configService: ConfigService) {}
}
