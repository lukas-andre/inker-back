import { Module } from '@nestjs/common';

import { ArtistsModule } from '../artists/artists.module';
import { ArtistsRepositoryModule } from '../artists/infrastructure/repositories/artistRepository.module';
import { CustomerRepositoryModule } from '../customers/infrastructure/providers/customerProvider.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserRepositoryModule } from '../users/infrastructure/repositories/userRepository.module';

import { AuthService } from './domain/auth.service';
import { AuthController } from './infrastructure/auth.controller';
import { AuthHandler } from './infrastructure/auth.handler';
import { DefaultLoginUseCase } from './usecases/defaultLogin.usecase';

@Module({
  imports: [
    ArtistsRepositoryModule,
    UserRepositoryModule,
    ArtistsModule,
    CustomerRepositoryModule,
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthHandler, AuthService, DefaultLoginUseCase],
})
export class AuthModule {}
