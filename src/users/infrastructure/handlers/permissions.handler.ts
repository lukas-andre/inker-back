import { Injectable, ConflictException } from '@nestjs/common';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
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
    const result = await this.initPermissionsUseCase.execute();

    if (result instanceof ServiceError) {
      throw new ConflictException(
        `Controller ${(result as ServiceError).subject} already exists`,
      );
    }

    return result;
  }

  async findRoutes() {
    return this.findAllRoutesUseCase.execute();
  }

  async findOne(id: string) {
    return await this.findOnePermissionUseCase.execute({ where: { id } });
  }
  async findAll(query: any) {
    return await this.findAllPermissionsUseCase.execute(query);
  }
}
