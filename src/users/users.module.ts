import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaModule } from '../agenda/agenda.module';
import { ArtistsModule } from '../artists/artists.module';
import { CustomersModule } from '../customers/customers.module';
import { LocationsModule } from '../locations/locations.module';
import { InitialPermissionsService } from './domain/services/initialPermissions.service';
import { PermissionsService } from './domain/services/permissions.service';
import { RolesService } from './domain/services/roles.service';
import { UsersService } from './domain/services/users.service';
import { VerificationHashService } from './domain/services/verificationHash.service';
import { PermissionsController } from './infrastructure/controllers/permissions.controller';
import { RolesController } from './infrastructure/controllers/roles.controller';
import { UsersController } from './infrastructure/controllers/users.controller';
import { Permission } from './infrastructure/entities/permission.entity';
import { Role } from './infrastructure/entities/role.entity';
import { User } from './infrastructure/entities/user.entity';
import { VerificationHash } from './infrastructure/entities/verificationHash.entity';
import { PermissionsHandler } from './infrastructure/handlers/permissions.handler';
import { RolesHandler } from './infrastructure/handlers/roles.handler';
import { UsersHandler } from './infrastructure/handlers/users.handler';
import { FindAllPermissionsUseCase } from './usecases/permission/findAllPermissions.usecase';
import { FindAllRoutesUseCase } from './usecases/permission/findAllRoutes.usecase';
import { FindOnePermissionUseCase } from './usecases/permission/findOnePermission.usecase';
import { InitPermissionsUseCase } from './usecases/permission/initPermissions.usecase';
import { FindAllRolesUseCase } from './usecases/role/findAllRoles.usecase';
import { FindOneRoleUseCase } from './usecases/role/findOneRole.usecase';
import { InitRolesUseCase } from './usecases/role/initRoles.usecase';
import { CreateUserByTypeUseCase } from './usecases/user/createUserByType.usecase';
import { SendSMSVerificationCodeUseCase } from './usecases/user/sendSMSVerificationCode.usecase';
import { ValidateSMSVerificationCodeUseCase } from './usecases/user/validateSMSVerificationCode.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, Role, Permission, VerificationHash],
      'user-db',
    ),
    CustomersModule,
    forwardRef(() => ArtistsModule),
    AgendaModule,
    LocationsModule,
  ],
  providers: [
    UsersService,
    UsersHandler,
    RolesService,
    RolesHandler,
    PermissionsService,
    VerificationHashService,
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
    SendSMSVerificationCodeUseCase,
    ValidateSMSVerificationCodeUseCase,
  ],
  controllers: [UsersController, PermissionsController, RolesController],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
