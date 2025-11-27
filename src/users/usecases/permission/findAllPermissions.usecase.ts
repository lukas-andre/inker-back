import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';

import { Permission } from '../../infrastructure/entities/permission.entity';
import { PermissionsRepository } from '../../infrastructure/repositories/permissions.repository';

@Injectable()
export class FindAllPermissionsUseCase {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute(options: FindOneOptions<Permission>) {
    return this.permissionsRepository.findAll(options);
  }
}
