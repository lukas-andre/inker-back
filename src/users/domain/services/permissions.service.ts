import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Permission } from '../../infrastructure/entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission, 'user-db')
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
