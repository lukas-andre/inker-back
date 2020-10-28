import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PermissionsService } from '../services/permissions.service';

import { RolesService } from '../services/roles.service';

@Injectable()
export class RolesHandler {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
    private readonly configService: ConfigService,
  ) {}

  async initRoles() {
    const permissions = await this.permissionsService.findAll({});
    return await this.rolesService.initRoles(permissions);
  }

  async findOne(id: number) {
    return await this.rolesService.findOne({ id });
  }
  async findAll(query: any) {
    return await this.rolesService.findAll(query);
  }
}
