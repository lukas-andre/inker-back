import { Injectable } from '@nestjs/common';
import { RolesService } from '../../domain/services/roles.service';

@Injectable()
export class FindAllRolesUseCase {
  constructor(private readonly rolesService: RolesService) {}

  async execute(query: any) {
    return await this.rolesService.findAll(query);
  }
}
