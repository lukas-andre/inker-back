import { Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { USER_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { DbServiceInternalServerError } from '../../../global/infrastructure/exceptions/dbService.exception';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class InitialPermissionsRepository extends BaseComponent {
  constructor(
    private modulesContainer: ModulesContainer,
    @InjectRepository(Permission, USER_DB_CONNECTION_NAME)
    private readonly permissionsRepository: Repository<Permission>,
  ) {
    super(InitialPermissionsRepository.name);
  }

  public async initPermissions(): Promise<Permission[]> {
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
        controller: controllerName,
        action: '*',
      });
      try {
        await this.permissionsRepository.save(permission);
      } catch (error) {
        throw new DbServiceInternalServerError(
          this,
          (error as Error).message,
          error,
        );
      }
    }

    return this.permissionsRepository.find();
  }

  public async getAllRoutes(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }
} 