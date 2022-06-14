import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import Joi from 'joi';
import config from '../config';
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
      load: config,
      // validationSchema: Joi.object(),
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
