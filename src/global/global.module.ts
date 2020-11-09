import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import userDb from '../config/userDatabase';
import app from '../config/app';
import auth from '../config/auth';
import aws from '../config/aws';
import customerDb from '../config/customerDatabase';
import artistDatabase from '../config/artistDatabase';
import { S3Client } from './clients/s3.client';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [app, userDb, customerDb, artistDatabase, auth, aws],
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secretOrPrivateKey: config.get('auth.jwtSecretKey'),
        signOptions: {
          expiresIn: config.get('auth.jwtExpiration'),
        },
      }),
    }),
  ],
  controllers: [],
  providers: [S3Client],
  exports: [ConfigModule, S3Client],
})
export class GlobalModule {}
