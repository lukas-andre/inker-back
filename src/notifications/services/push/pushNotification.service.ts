import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

import { DeviceType } from '../../database/entities/userFcmToken.entity';
import { NotificationRepository } from '../../database/notification.repository';

import { FCMPayloadUtil } from './utils';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private tokenRepository: NotificationRepository) {}

  async saveToken(userId: string, token: string, deviceType: DeviceType) {
    try {
      await this.tokenRepository.upsertFcmToken(
        {
          userId,
          token,
          deviceType,
          lastUsedAt: new Date(),
          isActive: true,
        },
        ['userId', 'token'],
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error saving token: ${error.message}`);
      } else {
        this.logger.error(
          `Error saving token: Unknown ${JSON.stringify(error)}`,
        );
      }
      throw error;
    }
  }

  async sendToUser(
    userId: string,
    notification: { title: string; body: string },
    data?: Record<string, any>,
  ) {
    const tokens = await this.tokenRepository.findFcmTokens({
      where: { userId, isActive: true },
    });

    if (!tokens.length) return;

    try {
      // lucas.henrydz@gmail.com
      // Here you can get more info the message structure
      // https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#apnsconfig

      const message: admin.messaging.MulticastMessage = {
        tokens: tokens.map(t => t.token),
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data ? FCMPayloadUtil.sanitizeData(data) : undefined,
        android: {
          priority: 'high',
          notification: {
            priority: 'high',
            // channelId: 'default', // Asegúrate de crear este canal en tu app Android
            sound: 'default',
            vibrateTimingsMillis: [200, 500, 200],
            visibility: 'public',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              sound: 'default',
              badge: 1,
              'mutable-content': 1,
              'content-available': 1,
            },
          },
          headers: {
            'apns-priority': '10',
            'apns-expiration': Math.floor(
              Date.now() / 1000 + 24 * 3600,
            ).toString(), // 24 hours
          },
        },
        // webpush: {
        //     notification: {
        //         title: notification.title,
        //         body: notification.body,
        //         icon: '/icon.png', // Asegúrate de tener este icono en tu app web
        //         badge: '/badge.png',
        //         vibrate: [200, 500, 200],
        //         requireInteraction: true,
        //     },
        //     headers: {
        //         TTL: '86400' // 24 hours in seconds
        //     }
        // }
      };

      this.logger.log(`Message: ${JSON.stringify(message)}`);

      this.logger.log(`Sending notification to ${tokens.length} tokens`);
      const response = await admin.messaging().sendEachForMulticast(message);

      // Desactivar tokens inválidos
      response.responses.forEach(async (res, idx) => {
        if (res.error) {
          this.logger.error(`Error sending notification: ${res.error.message}`);
        }
        if (res.error?.code === 'messaging/registration-token-not-registered') {
          // await this.tokenRepository.updateFcmToken(
          //     { token: tokens[idx].token },
          //     { isActive: false }
          // );
        }
        if (res.error?.code === 'messaging/invalid-argument') {
          // await this.tokenRepository.updateFcmToken(
          //     { token: tokens[idx].token },
          //     { isActive: false }
          // );
        }
      });

      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error sending notification: ${error.message}`);
      } else {
        this.logger.error(
          `Error sending notification: Unknown ${JSON.stringify(error)}`,
        );
      }
      throw error;
    }
  }
}
