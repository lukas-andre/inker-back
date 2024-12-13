import { Module } from '@nestjs/common';

import { ArtistsModule } from '../artists/artists.module';
import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { CustomerProviderModule } from '../customers/infrastructure/providers/customerProvider.module';
import { UserProviderModule } from '../users/infrastructure/providers/userProvider.module';

import { AuthService } from './domain/auth.service';
import { AuthController } from './infrastructure/auth.controller';
import { AuthHandler } from './infrastructure/auth.handler';
import { DefaultLoginUseCase } from './usecases/defaultLogin.usecase';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ArtistsProviderModule,
    UserProviderModule,
    ArtistsModule,
    CustomerProviderModule,
    NotificationsModule
  ],
  controllers: [AuthController],
  providers: [AuthHandler, AuthService, DefaultLoginUseCase],
})
export class AuthModule {}
