import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/createUser.dto';
import { ConfigService } from '@nestjs/config';
import { PermissionsService } from '../services/permissions.service';
import { InitialPermissionsService } from '../services/initialPermissions.service';
import { ServiceError } from '../../global/interfaces/serviceError.interface';

@Injectable()
export class PermissionsHandler {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly initialPermissionsService: InitialPermissionsService,
    private readonly configService: ConfigService,
  ) {}

  async handleInitial() {
    const result = await this.initialPermissionsService.initPermissions();
    if (result.hasOwnProperty('error')) {
      const error = result as ServiceError;
      throw new ConflictException(`Controller ${error.subject} already exists`);
    }

    return result;
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
