import { Injectable } from '@nestjs/common';

import { RolesProvider } from '../../infrastructure/providers/roles.service';

@Injectable()
export class FindOneRoleUseCase {
  constructor(private readonly rolesProvider: RolesProvider) {}

  async execute(id: number) {
    return this.rolesProvider.findOne({ where: { id } });
  }
}
