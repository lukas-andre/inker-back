import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';

import { Permission } from '../../infrastructure/entities/permission.entity';
import { PermissionsProvider } from '../../infrastructure/providers/permissions.service';

@Injectable()
export class FindOnePermissionUseCase {
  constructor(private readonly permissionsProvider: PermissionsProvider) {}

  async execute(options: FindOneOptions<Permission>) {
    return this.permissionsProvider.findOne(options);
  }
}
