import { Injectable } from '@nestjs/common';

import { FindAllPermissionsUseCase } from '../../usecases/permission/findAllPermissions.usecase';
import { FindAllRoutesUseCase } from '../../usecases/permission/findAllRoutes.usecase';
import { FindOnePermissionUseCase } from '../../usecases/permission/findOnePermission.usecase';
import { InitPermissionsUseCase } from '../../usecases/permission/initPermissions.usecase';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsHandler {
  constructor(
    private readonly initPermissionsUseCase: InitPermissionsUseCase,
    private readonly findAllRoutesUseCase: FindAllRoutesUseCase,
    private readonly findOnePermissionUseCase: FindOnePermissionUseCase,
    private readonly findAllPermissionsUseCase: FindAllPermissionsUseCase,
  ) {}

  async handleInitial(): Promise<Permission[]> {
    return this.initPermissionsUseCase.execute();
  }

  async findRoutes() {
    return this.findAllRoutesUseCase.execute();
  }

  async findOne(id: string) {
    return this.findOnePermissionUseCase.execute({ where: { id } });
  }
  async findAll(query: any) {
    return this.findAllPermissionsUseCase.execute(query);
  }
}
