import { Module } from '@nestjs/common';
import { AuthController } from './infrasctructure/controllers/auth.controller';
import { AuthImplService } from './use_cases/services/authImpl.service';
import { UsersModule } from '../users/users.module';
import { ArtistsModule } from '../artists/artists.module';
import { CustomersModule } from '../customers/customers.module';
import { AUTH_SERVICE_DI_TOKEN } from './use_cases/services/auth.service';
import { AUTH_HANDLER_DI_TOKEN } from './use_cases/auth.handler';
import { AuthImplHandler } from './use_cases/authImpl.handler';

@Module({
  imports: [UsersModule, ArtistsModule, CustomersModule],
  controllers: [AuthController],
  providers: [
    { provide: AUTH_SERVICE_DI_TOKEN, useClass: AuthImplService },
    { provide: AUTH_HANDLER_DI_TOKEN, useClass: AuthImplHandler },
    // AuthHandler,
  ],
})
export class AuthModule {}
