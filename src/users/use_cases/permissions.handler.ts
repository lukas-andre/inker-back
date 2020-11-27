import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { Permission } from '../infrastructure/entities/permission.entity';
import { InitialPermissionsService } from './services/initialPermissions.service';
import { PermissionsService } from './services/permissions.service';

@Injectable()
export class PermissionsHandler {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly initialPermissionsService: InitialPermissionsService,
    private readonly configService: ConfigService,
  ) {}

  async handleInitial(): Promise<Permission[] | HttpException> {
    const result = await this.initialPermissionsService.initPermissions();
    if (result.hasOwnProperty('error')) {
      throw new ConflictException(
        `Controller ${(result as ServiceError).subject} already exists`,
      );
    }

    return result as Permission[];
  }

  async findRoutes() {
    return this.initialPermissionsService.getAllRoutes();
  }

  async findOne(id: number) {
    return await this.permissionsService.findOne({ id });
  }
  async findAll(query: any) {
    return await this.permissionsService.findAll(query);
  }
}
