import { Injectable } from '@nestjs/common';

import { RolesProvider } from '../../infrastructure/providers/roles.service';

@Injectable()
export class FindAllRolesUseCase {
  constructor(private readonly rolesProvider: RolesProvider) {}

  async execute(query: any) {
    return this.rolesProvider.findAll(query);
  }
}
