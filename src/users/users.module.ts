import { Module } from '@nestjs/common';
import { UsersService } from './use_cases/services/users.service';
import { UsersController } from './infrastructure/controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { Role } from './infrastructure/entities/role.entity';
import { Permission } from './infrastructure/entities/permission.entity';
import { RolesService } from './use_cases/services/roles.service';
import { PermissionsService } from './use_cases/services/permissions.service';
import { InitialPermissionsService } from './use_cases/services/initialPermissions.service';
import { PermissionsController } from './infrastructure/controllers/permissions.controller';
import { RolesController } from './infrastructure/controllers/roles.controller';
import { RolesHandler } from './use_cases/roles.handler';
import { CustomersModule } from '../customers/customers.module';
import { ArtistsModule } from '../artists/artists.module';
import { UsersHandler } from './use_cases/users.handler';
import { PermissionsHandler } from './use_cases/permissions.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission], 'user-db'),
    CustomersModule,
    ArtistsModule,
  ],
  providers: [
    UsersService,
    UsersHandler,
    RolesService,
    RolesHandler,
    PermissionsService,
    PermissionsHandler,
    InitialPermissionsService,
  ],
  controllers: [UsersController, PermissionsController, RolesController],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
