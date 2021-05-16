import { Injectable } from '@nestjs/common';
import { RolesService } from '../../domain/services/roles.service';

@Injectable()
export class FindOneRoleUseCase {
  constructor(private readonly rolesService: RolesService) {}

  async execute(id: number) {
    return this.rolesService.findOne({ where: { id } });
  }
}
