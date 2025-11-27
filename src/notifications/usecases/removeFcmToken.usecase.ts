import { Injectable, Logger } from '@nestjs/common';
import { RemoveFcmTokenDto } from '../domain/dtos/fcmToken.dto';
import { NotificationRepository } from '../database/notification.repository';

@Injectable()
export class RemoveFcmTokenUseCase {
  private readonly logger = new Logger(RemoveFcmTokenUseCase.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(dto: RemoveFcmTokenDto): Promise<{ success: boolean }> {
    try {
      this.logger.log(
        `Removing FCM token for user ${dto.userId}`,
      );

      await this.notificationRepository.updateFcmToken(
        {
          token: dto.token,
          userId: dto.userId,
        },
        { isActive: false },
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error removing FCM token for user ${dto.userId}: ${(error as Error)?.message}`,
      );
      throw error;
    }
  }
}