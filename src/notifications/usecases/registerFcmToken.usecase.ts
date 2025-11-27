import { Injectable, Logger } from '@nestjs/common';
import { RegisterFcmTokenDto } from '../domain/dtos/fcmToken.dto';
import { PushNotificationService } from '../services/push/pushNotification.service';

@Injectable()
export class RegisterFcmTokenUseCase {
  private readonly logger = new Logger(RegisterFcmTokenUseCase.name);

  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) { }

  async execute(dto: RegisterFcmTokenDto): Promise<{ success: boolean }> {
    try {
      this.logger.log(
        `Registering FCM token for user ${dto.userId} with device type ${dto.deviceType}`,
      );

      await this.pushNotificationService.saveToken(
        dto.userId,
        dto.token,
        dto.deviceType,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error registering FCM token for user ${dto.userId}: ${(error as Error)?.message}`,
      );
      throw error;
    }
  }
}