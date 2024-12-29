import { Module } from '@nestjs/common';

import { AgendaProviderModule } from '../agenda/infrastructure/providers/agendaProvider.module';
import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { CustomerProviderModule } from '../customers/infrastructure/providers/customerProvider.module';
import { LocationProviderModule } from '../locations/infrastructure/database/locationProvider.module';

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
import { SettingsHandler } from './infrastructure/handlers/settings.handler';
import { GetSettingsUseCase } from './usecases/settings/getSettings.usecase';
import { UpdateLocationServicesUseCase } from './usecases/settings/updateLocationService.usecase';
import { UpdateNotificationsUseCase } from './usecases/settings/updateNotifications.usecase';
import { SettingsController } from './infrastructure/controllers/settings.controller';
import { DeleteUserUseCase } from './usecases/user/deleteUser.usecase';
import { SendSMSVerificationCodeUseCase } from './usecases/user/verification-code/sendSmsVerificationCode.usecase';
import { SendEmailVerificationCodeUseCase } from './usecases/user/verification-code/sendEmailVerificationCode.usecase';
import { NotificationQueueModule } from '../queues/notifications/notification.queue.module';
import { SendForgotPasswordCodeUseCase } from './usecases/user/sendForgotPasswordCode.usecase';
import { UpdateUserPasswordWithCodeUseCase } from './usecases/user/updateUserPasswordWithCode.usecase';

@Module({
  imports: [
    AgendaProviderModule,
    ArtistsProviderModule,
    CustomerProviderModule,
    LocationProviderModule,
    UserProviderModule,
    NotificationQueueModule,
  ],
  providers: [
    UsersHandler,
    RolesHandler,
    PermissionsHandler,
    SettingsHandler,
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
    GetSettingsUseCase,
    UpdateNotificationsUseCase,
    UpdateLocationServicesUseCase,
    SettingsHandler,
    DeleteUserUseCase,
    SendSMSVerificationCodeUseCase,
    SendEmailVerificationCodeUseCase,
    SendForgotPasswordCodeUseCase,
    UpdateUserPasswordWithCodeUseCase,
  ],
  controllers: [
    UsersController,
    PermissionsController,
    RolesController,
    SettingsController,
  ],
})
export class UsersModule {}
