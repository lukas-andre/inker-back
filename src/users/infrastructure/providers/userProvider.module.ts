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

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, Role, Permission, VerificationHash],
      USER_DB_CONNECTION_NAME,
    ),
  ],
  providers: [
    InitialPermissionsProvider,
    PermissionsProvider,
    RolesProvider,
    UsersProvider,
    VerificationHashProvider,
  ],
  exports: [
    InitialPermissionsProvider,
    PermissionsProvider,
    RolesProvider,
    UsersProvider,
    VerificationHashProvider,
  ],
})
export class UserProviderModule {}
