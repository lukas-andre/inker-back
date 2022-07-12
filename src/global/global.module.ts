import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { appConfigSchema } from '../config/app.config';
import { authConfigSchema } from '../config/auth.config';
import { AWSConfigSchema } from '../config/aws.config';
import { Config } from '../config/config';
import { databaseConfigSchema } from '../config/database/config';
import { oasConfigSchema } from '../config/oas.config';
import { verificationHashConfigSchema } from '../config/verificationHash';
import { LoggingInterceptor } from './aspects/logging.interceptor';
import { BaseHandler } from './infrastructure/base.handler';
import { S3Client } from './infrastructure/clients/s3.client';
import { SMSClient } from './infrastructure/clients/sms.client';

@Global()
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: Config,
      validationSchema: Joi.object()
        .concat(appConfigSchema)
        .concat(authConfigSchema)
        .concat(oasConfigSchema)
        .concat(verificationHashConfigSchema)
        .concat(AWSConfigSchema)
        .concat(databaseConfigSchema),
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
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [ConfigModule, S3Client, SMSClient, JwtModule],
})
export class GlobalModule {
  constructor(private readonly configService: ConfigService) {}
}
