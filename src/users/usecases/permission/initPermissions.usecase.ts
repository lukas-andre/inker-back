import { Injectable } from '@nestjs/common';

import { InitialPermissionsRepository } from '../../infrastructure/repositories/initialPermissions.repository';

@Injectable()
export class InitPermissionsUseCase {
  constructor(
    private readonly permissionsRepository: InitialPermissionsRepository,
  ) {}

  async execute() {
    return this.permissionsRepository.initPermissions();
  }
}
