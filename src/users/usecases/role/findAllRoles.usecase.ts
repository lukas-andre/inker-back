import { Injectable } from '@nestjs/common';
import { RolesRepository } from '../../infrastructure/repositories/roles.repository';

@Injectable()
export class FindAllRolesUseCase {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async execute(query: any) {
    return this.rolesRepository.findAll(query);
  }
}
