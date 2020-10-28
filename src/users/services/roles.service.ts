import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { initRolePermissions } from '../data/initRolePermission.data';
import { initRoles } from '../data/initRoles.data';
import { Permission } from '../entities/permission.entity';

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

    return await this.findAll({});
  }

  async findAll(query: any): Promise<Role[]> {
    const { limit, offset, ...rest } = query;
    return await this.rolesRepository.find({
      where: rest,
      order: {
        created_at: 'ASC',
      },
      skip: offset,
      take: limit,
      cache: true,
    });
  }

  async findById(id: number): Promise<Role> {
    return await this.rolesRepository.findOne(id, {
      relations: ['permissions'],
    });
  }

  async findOne(query: any): Promise<Role> {
    return await this.rolesRepository.findOne(query);
  }
}
