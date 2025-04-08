import { Injectable } from '@nestjs/common';
import { Settings } from '../../infrastructure/entities/settings.entity';
import { SettingsRepository } from '../../infrastructure/repositories/settings.repository';

@Injectable()
export class UpdateNotificationsUseCase {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async execute(userId: string, enabled: boolean): Promise<Settings> {
    const settings = await this.settingsRepository.findByUserId(userId);

    if (!settings) {
      return this.settingsRepository.upsert({
        userId,
        notificationsEnabled: enabled,
        locationServicesEnabled: true,
      });
    }

    return this.settingsRepository.updateNotifications(userId, enabled);
  }
}
