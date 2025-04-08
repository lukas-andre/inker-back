import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { USER_DB_CONNECTION_NAME } from '../../../databases/constants';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { Settings } from '../entities/settings.entity';
import { User } from '../entities/user.entity';
import { VerificationHash } from '../entities/verificationHash.entity';
import { InitialPermissionsRepository } from './initialPermissions.repository';
import { PermissionsRepository } from './permissions.repository';
import { RolesRepository } from './roles.repository';
import { SettingsRepository } from './settings.repository';
import { UsersRepository } from './users.repository';
import { VerificationHashRepository } from './verificationHash.repository';


@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, Role, Permission, Settings, VerificationHash],
      USER_DB_CONNECTION_NAME,
    ),
  ],
  providers: [
    UsersRepository,
    RolesRepository,
    PermissionsRepository,
    SettingsRepository,
    VerificationHashRepository,
    InitialPermissionsRepository,
  ],
  exports: [
    UsersRepository,
    RolesRepository,
    PermissionsRepository,
    SettingsRepository,
    VerificationHashRepository,
    InitialPermissionsRepository,
  ],
})
export class UserRepositoryModule {} 