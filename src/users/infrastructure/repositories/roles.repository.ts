import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { USER_DB_CONNECTION_NAME } from '../../../databases/constants';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { initRolePermissions } from '../../domain/data/initRolePermission.data';
import { initRoles } from '../../domain/data/initRoles.data';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role, USER_DB_CONNECTION_NAME)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  public async initRoles(permissions: Permission[]): Promise<Role[]> {
    for (const initRole of initRoles) {
      const role = Object.assign(new Role(), initRole);
      if (initRole.name !== 'admin') {
        role.permissions = permissions.filter(permission =>
          initRolePermissions
            .find(init => init.role === role.name)
            .controllers.includes(permission.controller),
        );
      }
      await this.rolesRepository.save(role);
    }

    return this.findAll({});
  }

  public async exists(roleName: string): Promise<boolean> {
    const [result]: ExistsQueryResult[] = await this.rolesRepository.query(
      'SELECT EXISTS(SELECT 1 FROM role WHERE name=$1)',
      [roleName],
    );
    return result.exists;
  }

  public async findAll(query: any): Promise<Role[]> {
    const { limit, offset, ...rest } = query;
    return this.rolesRepository.find({
      where: rest,
      order: {
        createdAt: 'ASC',
      },
      skip: offset,
      take: limit,
      cache: true,
    });
  }

  public async findById(id: string): Promise<Role> {
    return this.rolesRepository.findOne({
      where: {
        id,
      },
      relations: ['permissions'],
    });
  }

  public async findOne(query: FindOneOptions<Role>): Promise<Role> {
    return this.rolesRepository.findOne(query);
  }
} 