import { Injectable } from '@nestjs/common';
import { SettingsProvider } from '../../infrastructure/providers/settings.provider';
import { Settings } from '../../infrastructure/entities/settings.entity';

@Injectable()
export class GetSettingsUseCase {
  constructor(private readonly settingsProvider: SettingsProvider) {}

  async execute(userId: number): Promise<Settings> {
    const settings = await this.settingsProvider.findByUserId(userId);
    
    if (!settings) {
      // Return default settings if none exist
      return this.settingsProvider.upsert({
        userId,
        notificationsEnabled: true,
        locationServicesEnabled: true,
      });
    }

    return settings;
  }
}