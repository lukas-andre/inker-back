import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UsersHandler } from './handlers/users.handler';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import { InitialPermissionsService } from './services/initialPermissions.service';
import { PermissionsController } from './controllers/permissions.controller';
import { RolesController } from './controllers/roles.controller';
import { PermissionsHandler } from './handlers/permissions.handler';
import { RolesHandler } from './handlers/roles.handler';
import { CustomersModule } from 'src/customers/customers.module';
import { ArtistsModule } from 'src/artists/artists.module';

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
