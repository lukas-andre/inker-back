import { Module } from '@nestjs/common';

import { ArtistsModule } from '../artists/artists.module';
import { ArtistsDbModule } from '../artists/infrastructure/database/artistDb.module';
import { CustomerProviderModule } from '../customers/infrastructure/providers/customerProvider.module';
import { UserProviderModule } from '../users/infrastructure/providers/userProvider.module';

import { AuthService } from './domain/auth.service';
import { AuthController } from './infrastructure/auth.controller';
import { AuthHandler } from './infrastructure/auth.handler';
import { DefaultLoginUseCase } from './usecases/defaultLogin.usecase';

@Module({
  imports: [
    ArtistsDbModule,
    UserProviderModule,
    ArtistsModule,
    CustomerProviderModule,
  ],
  controllers: [AuthController],
  providers: [AuthHandler, AuthService, DefaultLoginUseCase],
})
export class AuthModule {}
