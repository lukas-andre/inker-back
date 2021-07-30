import { Module } from '@nestjs/common';
import { UsersService } from './domain/services/users.service';
import { UsersController } from './infrastructure/controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { Role } from './infrastructure/entities/role.entity';
import { Permission } from './infrastructure/entities/permission.entity';
import { RolesService } from './domain/services/roles.service';
import { PermissionsService } from './domain/services/permissions.service';
import { InitialPermissionsService } from './domain/services/initialPermissions.service';
import { PermissionsController } from './infrastructure/controllers/permissions.controller';
import { RolesController } from './infrastructure/controllers/roles.controller';
import { CustomersModule } from '../customers/customers.module';
import { ArtistsModule } from '../artists/artists.module';
import { UsersHandler } from './infrastructure/handlers/users.handler';
import { RolesHandler } from './infrastructure/handlers/roles.handler';
import { PermissionsHandler } from './infrastructure/handlers/permissions.handler';
import { CreateUserByTypeUseCase } from './usecases/user/createUserByType.usecase';
import { FindAllRolesUseCase } from './usecases/role/findAllRoles.usecase';
import { FindOneRoleUseCase } from './usecases/role/findOneRole.usecase';
import { FindOnePermissionUseCase } from './usecases/permission/findOnePermission.usecase';
import { FindAllPermissionsUseCase } from './usecases/permission/findAllPermissions.usecase';
import { InitRolesUseCase } from './usecases/role/initRoles.usecase';
import { InitPermissionsUseCase } from './usecases/permission/initPermissions.usecase';
import { FindAllRoutesUseCase } from './usecases/permission/findAllRoutes.usecase';
import { AgendaModule } from '../agenda/agenda.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission], 'user-db'),
    CustomersModule,
    ArtistsModule,
    AgendaModule,
    LocationsModule,
  ],
  providers: [
    UsersService,
    UsersHandler,
    RolesService,
    RolesHandler,
    PermissionsService,
    PermissionsHandler,
    InitialPermissionsService,
    InitRolesUseCase,
    InitPermissionsUseCase,
    CreateUserByTypeUseCase,
    FindAllRolesUseCase,
    FindOneRoleUseCase,
    FindOnePermissionUseCase,
    FindAllPermissionsUseCase,
    FindAllRoutesUseCase,
  ],
  controllers: [UsersController, PermissionsController, RolesController],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
