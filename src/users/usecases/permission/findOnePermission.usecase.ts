import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';

import { Permission } from '../../infrastructure/entities/permission.entity';
import { PermissionsRepository } from '../../infrastructure/repositories/permissions.repository';

@Injectable()
export class FindOnePermissionUseCase {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute(options: FindOneOptions<Permission>) {
    return this.permissionsRepository.findOne(options);
  }
}
