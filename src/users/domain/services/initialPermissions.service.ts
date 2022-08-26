import { Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { DbServiceInternalServerError } from '../../../global/infrastructure/exceptions/dbService.exception';
import { Permission } from '../../infrastructure/entities/permission.entity';

@Injectable()
export class InitialPermissionsService extends BaseComponent {
  constructor(
    private modulesContainer: ModulesContainer,
    @InjectRepository(Permission, 'user-db')
    private readonly permissionsRepository: Repository<Permission>,
  ) {
    super(InitialPermissionsService.name);
  }

  async initPermissions(): Promise<Permission[]> {
    const controllersNames = new Set<string>();

    const providers = [...this.modulesContainer.values()];
    providers.forEach(modules => {
      modules.controllers.forEach(controller =>
        controllersNames.add(controller.name),
      );
    });

    const controllersNamesList = [...controllersNames.values()].sort();
    for (const [index, controllerName] of controllersNamesList.entries()) {
      const permission = Object.assign(new Permission(), {
        id: index,
        controller: controllerName,
        action: '*',
      });
      try {
        await this.permissionsRepository.save(permission);
      } catch (error) {
        throw new DbServiceInternalServerError(this, error.detail, error);
      }
    }

    return this.permissionsRepository.find();
  }

  async getAllRoutes(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }
}
