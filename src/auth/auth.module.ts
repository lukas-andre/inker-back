import { Module } from '@nestjs/common';
import { AuthController } from './infrasctructure/auth.controller';
import { UsersModule } from '../users/users.module';
import { ArtistsModule } from '../artists/artists.module';
import { CustomersModule } from '../customers/customers.module';
import { AuthHandler } from './infrasctructure/auth.handler';
import { AuthService } from './domain/auth.service';
import { DefaultLoginUseCase } from './usecases/defaultLogin.usecase';

@Module({
  imports: [UsersModule, ArtistsModule, CustomersModule],
  controllers: [AuthController],
  providers: [AuthHandler, AuthService, DefaultLoginUseCase],
})
export class AuthModule {}
