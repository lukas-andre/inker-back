import { Injectable } from '@nestjs/common';

import { PermissionsRepository } from '../../infrastructure/repositories/permissions.repository';
import { RolesRepository } from '../../infrastructure/repositories/roles.repository';

@Injectable()
export class InitRolesUseCase {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async execute() {
    const permissions = await this.permissionsRepository.findAll({});
    return this.rolesRepository.initRoles(permissions);
  }
}
