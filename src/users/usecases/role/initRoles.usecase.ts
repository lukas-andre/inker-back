import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { PermissionsService } from '../../domain/services/permissions.service';
import { RolesService } from '../../domain/services/roles.service';
import { Permission } from '../../infrastructure/entities/permission.entity';

@Injectable()
export class InitRolesUseCase {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async execute() {
    const permissions = await this.permissionsService.findAll({});
    return this.rolesService.initRoles(permissions);
  }
}
