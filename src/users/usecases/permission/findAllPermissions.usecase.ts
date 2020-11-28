import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { PermissionsService } from '../../domain/services/permissions.service';
import { Permission } from '../../infrastructure/entities/permission.entity';

@Injectable()
export class FindAllPermissionsUseCase {
  constructor(private readonly permissionsService: PermissionsService) {}

  async execute(options: FindOneOptions<Permission>) {
    return this.permissionsService.findAll(options);
  }
}
