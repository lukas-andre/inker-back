import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Permission } from '../../infrastructure/entities/permission.entity';
import { Role } from '../../infrastructure/entities/role.entity';
import { initRolePermissions } from '../data/initRolePermission.data';
import { initRoles } from '../data/initRoles.data';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role, 'user-db')
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async initRoles(permissions: Permission[]) {
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

  async findAll(query: any): Promise<Role[]> {
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

  async findById(id: number): Promise<Role> {
    return this.rolesRepository.findOne( {
      where: {
        id,
      },
      relations: ['permissions'],
    });
  }

  async findOne(query: FindOneOptions<Role>): Promise<Role> {
    return this.rolesRepository.findOne(query);
  }
}
