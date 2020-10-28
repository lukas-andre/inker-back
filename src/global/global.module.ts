import {
  Global,
  Module,
  RequestMethod,
  MiddlewareConsumer,
} from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';

import * as path from 'path';
import { ConfigService, ConfigModule } from '@nestjs/config';
import userDb from '../config/userDatabase';
import app from '../config/app';
import auth from '../config/auth';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [app, userDb, auth],
    }),
    // TODO: Agregar Auth !
    // JwtModule.registerAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     secretOrPrivateKey: config.get('auth.jwtSecretKey'),
    //     signOptions: {
    //       expiresIn: config.get('auth.jwtExpiration'),
    //     },
    //   }),
    // }),
  ],
  controllers: [],
  providers: [],
  exports: [ConfigModule],
})
export class GlobalModule {}
