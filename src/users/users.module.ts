import { Module } from '@nestjs/common';

import { AgendaProviderModule } from '../agenda/infrastructure/providers/agendaProvider.module';
import { ArtistsDbModule } from '../artists/infrastructure/database/artistDb.module';
import { CustomerProviderModule } from '../customers/infrastructure/providers/customerProvider.module';
import { LocationDbModule } from '../locations/infrastructure/database/locationDb.module';

import { PermissionsController } from './infrastructure/controllers/permissions.controller';
import { RolesController } from './infrastructure/controllers/roles.controller';
import { UsersController } from './infrastructure/controllers/users.controller';
import { PermissionsHandler } from './infrastructure/handlers/permissions.handler';
import { RolesHandler } from './infrastructure/handlers/roles.handler';
import { UsersHandler } from './infrastructure/handlers/users.handler';
import { UserProviderModule } from './infrastructure/providers/userProvider.module';
import { FindAllPermissionsUseCase } from './usecases/permission/findAllPermissions.usecase';
import { FindAllRoutesUseCase } from './usecases/permission/findAllRoutes.usecase';
import { FindOnePermissionUseCase } from './usecases/permission/findOnePermission.usecase';
import { InitPermissionsUseCase } from './usecases/permission/initPermissions.usecase';
import { FindAllRolesUseCase } from './usecases/role/findAllRoles.usecase';
import { FindOneRoleUseCase } from './usecases/role/findOneRole.usecase';
import { InitRolesUseCase } from './usecases/role/initRoles.usecase';
import { CreateUserByTypeUseCase } from './usecases/user/createUserByType.usecase';
import { SendSMSAccountVerificationCodeUseCase } from './usecases/user/sendSMSAccountVerificationCode.usecase';
import { SendSMSForgotPasswordCodeUseCase } from './usecases/user/sendSMSForgotPasswordCode.usecase';
import { UpdateUserEmailUseCase } from './usecases/user/updateUserEmail.usecase';
import { UpdateUserPasswordUseCase } from './usecases/user/updateUserPassword.usecase';
import { UpdateUserUsernameUseCase } from './usecases/user/updateUserUsername.usecase';
import { ValidateSMSAccountVerificationCodeUseCase } from './usecases/user/validateSMSAccountVerificationCode.usecase';

@Module({
  imports: [
    AgendaProviderModule,
    ArtistsDbModule,
    CustomerProviderModule,
    LocationDbModule,
    UserProviderModule,
  ],
  providers: [
    UsersHandler,
    RolesHandler,
    PermissionsHandler,
    InitRolesUseCase,
    InitPermissionsUseCase,
    CreateUserByTypeUseCase,
    FindAllRolesUseCase,
    FindOneRoleUseCase,
    FindOnePermissionUseCase,
    FindAllPermissionsUseCase,
    FindAllRoutesUseCase,
    SendSMSAccountVerificationCodeUseCase,
    SendSMSForgotPasswordCodeUseCase,
    UpdateUserEmailUseCase,
    UpdateUserPasswordUseCase,
    UpdateUserUsernameUseCase,
    ValidateSMSAccountVerificationCodeUseCase,
  ],
  controllers: [UsersController, PermissionsController, RolesController],
})
export class UsersModule {}
