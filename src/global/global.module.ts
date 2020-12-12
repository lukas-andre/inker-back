import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { S3Client } from './infrastructure/clients/s3.client';
import { BaseHandler } from './infrastructure/base.handler';
import config from '../config'
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
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
  providers: [BaseHandler, S3Client],
  exports: [ConfigModule, S3Client, JwtModule],
})
export class GlobalModule {}
