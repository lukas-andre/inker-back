import { Injectable } from '@nestjs/common';

import { Settings } from '../../infrastructure/entities/settings.entity';
import { SettingsRepository } from '../../infrastructure/repositories/settings.repository';

@Injectable()
export class GetSettingsUseCase {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async execute(userId: string): Promise<Settings> {
    const settings = await this.settingsRepository.findByUserId(userId);

    if (!settings) {
      // Return default settings if none exist
      return this.settingsRepository.upsert({
        userId,
        notificationsEnabled: true,
        locationServicesEnabled: true,
      });
    }

    return settings;
  }
}
