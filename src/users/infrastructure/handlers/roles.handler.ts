import { Injectable } from '@nestjs/common';

import { FindAllRolesUseCase } from '../../usecases/role/findAllRoles.usecase';
import { FindOneRoleUseCase } from '../../usecases/role/findOneRole.usecase';
import { InitRolesUseCase } from '../../usecases/role/initRoles.usecase';

@Injectable()
export class RolesHandler {
  constructor(
    private readonly initRolesUseCase: InitRolesUseCase,
    private readonly findOneRoleUseCase: FindOneRoleUseCase,
    private readonly findAllRolesUseCase: FindAllRolesUseCase,
  ) {}

  async initRoles() {
    return this.initRolesUseCase.execute();
  }

  async findOne(id: number) {
    return this.findOneRoleUseCase.execute(id);
  }
  async findAll(query: any) {
    return this.findAllRolesUseCase.execute(query);
  }
}
