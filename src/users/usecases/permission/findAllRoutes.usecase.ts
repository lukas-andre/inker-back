import { Injectable } from '@nestjs/common';

import { InitialPermissionsProvider } from '../../infrastructure/providers/initialPermissions.service';

@Injectable()
export class FindAllRoutesUseCase {
  constructor(
    private readonly permissionsProvider: InitialPermissionsProvider,
  ) {}

  async execute() {
    return this.permissionsProvider.getAllRoutes();
  }
}
