import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { PermissionsService } from '../../domain/services/permissions.service';
import { Permission } from '../../infrastructure/entities/permission.entity';

@Injectable()
export class FindOnePermissionUseCase {
  constructor(private readonly permissionsService: PermissionsService) {}

  async execute(options: FindOneOptions<Permission>) {
    return this.permissionsService.findOne(options);
  }
}
