import { Injectable } from '@nestjs/common';
import { SettingsProvider } from '../../infrastructure/providers/settings.provider';
import { Settings } from '../../infrastructure/entities/settings.entity';

@Injectable()
export class UpdateNotificationsUseCase {
  constructor(private readonly settingsProvider: SettingsProvider) {}

  async execute(userId: number, enabled: boolean): Promise<Settings> {
    const settings = await this.settingsProvider.findByUserId(userId);
    
    if (!settings) {
      // Create new settings if none exist
      return this.settingsProvider.upsert({
        userId,
        notificationsEnabled: enabled,
        locationServicesEnabled: true, // default value
      });
    }

    return this.settingsProvider.updateNotifications(userId, enabled);
  }
}