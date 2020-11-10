import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { ArtistsModule } from '../artists/artists.module';
import { CustomersModule } from '../customers/customers.module';
import { AuthHandler } from './handlers/auth.handler';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UsersModule, ArtistsModule, CustomersModule],
  controllers: [AuthController],
  providers: [AuthService, AuthHandler],
})
export class AuthModule {}
