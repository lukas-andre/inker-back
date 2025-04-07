import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { USER_DB_CONNECTION_NAME } from '../../../databases/constants';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { VerificationHash } from '../entities/verificationHash.entity';

import { InitialPermissionsProvider } from './initialPermissions.service';
import { PermissionsProvider } from './permissions.service';
import { RolesProvider } from './roles.service';
import { UsersProvider } from './users.provider';
import { VerificationHashProvider } from './verificationHash.service';
import { Settings } from '../entities/settings.entity';
import { SettingsProvider } from './settings.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, Role, Permission, VerificationHash, Settings],
      USER_DB_CONNECTION_NAME,
    ),
  ],
  providers: [
    InitialPermissionsProvider,
    PermissionsProvider,
    RolesProvider,
    UsersProvider,
    VerificationHashProvider,
    SettingsProvider,
  ],
  exports: [
    InitialPermissionsProvider,
    PermissionsProvider,
    RolesProvider,
    UsersProvider,
    VerificationHashProvider,
    SettingsProvider,
  ],
})
export class UserProviderModule {}
