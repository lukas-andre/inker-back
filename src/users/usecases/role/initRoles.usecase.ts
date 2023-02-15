import { Injectable } from '@nestjs/common';

import { PermissionsProvider } from '../../infrastructure/providers/permissions.service';
import { RolesProvider } from '../../infrastructure/providers/roles.service';

@Injectable()
export class InitRolesUseCase {
  constructor(
    private readonly rolesProvider: RolesProvider,
    private readonly permissionsProvider: PermissionsProvider,
  ) {}

  async execute() {
    const permissions = await this.permissionsProvider.findAll({});
    return this.rolesProvider.initRoles(permissions);
  }
}
