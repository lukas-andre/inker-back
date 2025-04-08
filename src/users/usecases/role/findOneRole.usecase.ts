import { Injectable } from '@nestjs/common';

import { RolesRepository } from '../../infrastructure/repositories/roles.repository';

@Injectable()
export class FindOneRoleUseCase {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async execute(id: string) {
    return this.rolesRepository.findOne({ where: { id } });
  }
}
