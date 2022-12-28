import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { USER_DB_CONNECTION_NAME } from '../../../databases/constants';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsProvider {
  constructor(
    @InjectRepository(Permission, USER_DB_CONNECTION_NAME)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  async findAll(query: any): Promise<Permission[]> {
    const { limit, offset, ...rest } = query;
    return this.permissionsRepository.find({
      where: rest,
      order: {
        createdAt: 'ASC',
      },
      skip: offset,
      take: limit,
      cache: true,
    });
  }

  async findOne(options?: FindOneOptions<Permission>): Promise<Permission> {
    return this.permissionsRepository.findOne(options);
  }
}
