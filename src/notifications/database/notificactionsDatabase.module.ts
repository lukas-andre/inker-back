import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NOTIFICATIONS_DB_CONNECTION_NAME } from '../../databases/constants';
import { Notification } from './entities/notification.entity';
import { UserFcmToken } from './entities/userFcmToken.entity';
import { NotificationRepository } from './notification.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Notification, UserFcmToken],
      NOTIFICATIONS_DB_CONNECTION_NAME,
    ),
  ],
  providers: [NotificationRepository],
  exports: [NotificationRepository],
})
export class NotificationsDatabaseModule {}
