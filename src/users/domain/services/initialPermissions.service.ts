import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../infrastructure/entities/permission.entity';
import { Repository } from 'typeorm';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';

@Injectable()
export class InitialPermissionsService {
  private readonly serviceName = InitialPermissionsService.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(
    @Inject('ModulesContainer') private readonly container: ModulesContainer,
    @InjectRepository(Permission, 'user-db')
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  async initPermissions(): Promise<Permission[] | ServiceError> {
    const controllersNames = new Set<string>();

    const providers = [...this.container.values()];
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
        this.logger.error(error.detail);
        return { error: this.serviceName, subject: controllerName };
      }
    }

    return this.permissionsRepository.find();
  }

  async getAllRoutes(): Promise<Permission[] | ServiceError> {
    return this.permissionsRepository.find();
  }
}
