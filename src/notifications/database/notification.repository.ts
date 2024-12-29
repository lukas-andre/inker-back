import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  ObjectId,
  Repository,
} from 'typeorm';
import { NOTIFICATIONS_DB_CONNECTION_NAME } from '../../databases/constants';
import { Notification } from './entities/notification.entity';
import { UserFcmToken } from './entities/userFcmToken.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification, NOTIFICATIONS_DB_CONNECTION_NAME)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserFcmToken, NOTIFICATIONS_DB_CONNECTION_NAME)
    private readonly userFcmTokenRepository: Repository<UserFcmToken>,
  ) {}

  async createNotification(
    notification: Partial<Notification>,
  ): Promise<Notification> {
    const newNotification = this.notificationRepository.create(notification);
    return await this.notificationRepository.save(newNotification);
  }

  async findNotificationById(id: string): Promise<Notification> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  async findNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.notificationRepository.update(id, { read: true });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async saveUserFcmToken(token: Partial<UserFcmToken>): Promise<UserFcmToken> {
    const newToken = this.userFcmTokenRepository.create(token);
    return await this.userFcmTokenRepository.save(newToken);
  }

  async findActiveTokensByUserId(userId: number): Promise<UserFcmToken[]> {
    return await this.userFcmTokenRepository.find({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async deactivateToken(token: string): Promise<void> {
    await this.userFcmTokenRepository.update({ token }, { isActive: false });
  }

  async updateTokenLastUsed(token: string): Promise<void> {
    await this.userFcmTokenRepository.update(
      { token },
      { lastUsedAt: new Date() },
    );
  }

  async upsertFcmToken(token: Partial<UserFcmToken>, conflictPaths: string[]) {
    return await this.userFcmTokenRepository.upsert(token, { conflictPaths });
  }

  async findFcmTokens(options: FindManyOptions<UserFcmToken>) {
    return await this.userFcmTokenRepository.find(options);
  }

  async updateFcmToken(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | FindOptionsWhere<UserFcmToken>,
    partialEntity: QueryDeepPartialEntity<UserFcmToken>,
  ) {
    return await this.userFcmTokenRepository.update(criteria, partialEntity);
  }
}
