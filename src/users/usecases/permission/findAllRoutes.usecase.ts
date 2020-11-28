
import { Injectable } from '@nestjs/common';
import { InitialPermissionsService } from '../../domain/services/initialPermissions.service';

@Injectable()
export class FindAllRoutesUseCase {
  constructor(
    private readonly permissionsService: InitialPermissionsService
  ) {}

  async execute() {
    return this.permissionsService.getAllRoutes();
  }
}
