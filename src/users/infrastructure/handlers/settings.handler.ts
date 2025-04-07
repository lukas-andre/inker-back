import { Injectable } from '@nestjs/common';
import { GetSettingsUseCase } from '../../usecases/settings/getSettings.usecase';
import { UpdateNotificationsUseCase } from '../../usecases/settings/updateNotifications.usecase';
import { UpdateLocationServicesUseCase } from '../../usecases/settings/updateLocationService.usecase';

@Injectable()
export class SettingsHandler {
  constructor(
    private readonly getSettingsUseCase: GetSettingsUseCase,
    private readonly updateNotificationsUseCase: UpdateNotificationsUseCase,
    private readonly updateLocationServicesUseCase: UpdateLocationServicesUseCase,
  ) {}

  async handleGetSettings(userId: number) {
    return this.getSettingsUseCase.execute(userId);
  }

  async handleUpdateNotifications(userId: number, enabled: boolean) {
    return this.updateNotificationsUseCase.execute(userId, enabled);
  }

  async handleUpdateLocationServices(userId: number, enabled: boolean) {
    return this.updateLocationServicesUseCase.execute(userId, enabled);
  }
}
