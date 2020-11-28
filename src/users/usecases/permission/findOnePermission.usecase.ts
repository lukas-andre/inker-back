
import { Injectable } from '@nestjs/common';
import { PermissionsService } from '../../domain/services/permissions.service';
import { Permission } from '../../infrastructure/entities/permission.entity';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class FindOnePermissionUseCase {
  constructor(
    private readonly permissionsService: PermissionsService 
  ) {}

  async execute(options: FindOneOptions<Permission>) {
    return this.permissionsService.findOne(options);
  }
}
