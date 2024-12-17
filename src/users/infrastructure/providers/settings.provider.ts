

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../entities/settings.entity';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { USER_DB_CONNECTION_NAME } from '../../../databases/constants';

@Injectable()
export class SettingsProvider extends BaseComponent {
  constructor(
    @InjectRepository(Settings, USER_DB_CONNECTION_NAME)
    private readonly settingsRepository: Repository<Settings>,
  ) {
    super(SettingsProvider.name);
  }

  async findByUserId(userId: number): Promise<Settings | undefined> {
    return this.settingsRepository.findOne({ where: { userId } });
  }

  async upsert(settings: Partial<Settings>): Promise<Settings> {
    const existing = await this.findByUserId(settings.userId);
    if (existing) {
      return this.settingsRepository.save({
        ...existing,
        ...settings,
      });
    }
    return this.settingsRepository.save(settings);
  }

  async updateNotifications(userId: number, enabled: boolean): Promise<Settings> {
    const settings = await this.findByUserId(userId);
    return this.settingsRepository.save({
      ...settings,
      notificationsEnabled: enabled,
    });
  }

  async updateLocationServices(userId: number, enabled: boolean): Promise<Settings> {
    const settings = await this.findByUserId(userId);
    return this.settingsRepository.save({
      ...settings,
      locationServicesEnabled: enabled,
    });
  }
}