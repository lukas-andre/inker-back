import {
  Global,
  Module,
  RequestMethod,
  MiddlewareConsumer,
} from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';

import * as path from 'path';
import { ConfigService, ConfigModule } from '@nestjs/config';
import userDatabase from '../config/userDatabase';
import app from '../config/app';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [app, userDatabase],
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
  exports: [],
})
export class GlobalModule {}
