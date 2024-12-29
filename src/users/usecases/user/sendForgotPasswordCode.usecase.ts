import { InjectQueue } from '@nestjs/bull';
import {
  DomainBadRequest,
  DomainBadRule,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import { UseCase } from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import { SendVerificationCodeJobType } from '../../../queues/notifications/domain/schemas/codes';
import { SendForgotPasswordCodeReqDto } from '../../infrastructure/dtos/sendForgotPasswordCodeReq.dto';
import { User } from '../../infrastructure/entities/user.entity';
import {
  NotificationType,
  VerificationType,
} from '../../infrastructure/entities/verificationHash.entity';
import { UsersProvider } from '../../infrastructure/providers/users.provider';
import { VerificationHashProvider } from '../../infrastructure/providers/verificationHash.service';
import { queues } from '../../../queues/queues';
import { Queue } from 'bull';

export class SendForgotPasswordCodeUseCase implements UseCase {
  static readonly THRESHOLD: Record<NotificationType, number> = {
    [NotificationType.SMS]: 3,
    [NotificationType.EMAIL]: 10,
  };

  constructor(
    private readonly usersProvider: UsersProvider,
    private readonly verificationHashProvider: VerificationHashProvider,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {}

  async execute(
    sendForgotPasswordCodeReqDto: SendForgotPasswordCodeReqDto,
  ): Promise<DefaultResponseDto> {
    const { email, phoneNumber } = sendForgotPasswordCodeReqDto;

    if (!email && !phoneNumber) {
      throw new DomainBadRequest(
        'At least one identifier (email, phone number, or username) must be provided',
      );
    }

    let user: User | null = null;

    if (email) {
      user = await this.usersProvider.findOne({ where: { email } });
    } else if (phoneNumber) {
      user = await this.usersProvider.findOne({ where: { phoneNumber } });
    }

    if (!user) {
      throw new DomainNotFound('User not found');
    }

    const verificationCode = await this.generateVerificationCode();

    const notificationType = email
      ? NotificationType.EMAIL
      : NotificationType.SMS;
    const verificationType = VerificationType.FORGOT_PASSWORD;

    const existingHash = await this.verificationHashProvider.findOne({
      where: {
        userId: user.id,
        notificationType,
        verificationType,
      },
    });

    if (existingHash) {
      if (
        existingHash.tries >=
        SendForgotPasswordCodeUseCase.THRESHOLD[notificationType]
      ) {
        throw new DomainBadRule('Maximum email attempts reached');
      }
      await this.verificationHashProvider.edit(existingHash.id, {
        tries: existingHash.tries + 1,
        hash: await this.verificationHashProvider.hashVerificationCode(
          verificationCode,
        ),
      });
    } else {
      await this.verificationHashProvider.create(
        user.id,
        verificationCode,
        notificationType,
        verificationType,
        1,
        email,
      );
    }

    const notificationTypeId: 'EMAIL' | 'PUSH' = email ? 'EMAIL' : 'PUSH';

    const noficationData: SendVerificationCodeJobType = {
      jobId: 'ACCOUNT_VERIFICATION_CODE',
      notificationTypeId,
      metadata: {
        email: user.email,
        phoneNumber: user.phoneNumber,
        code: verificationCode,
        expirationTime:
          SendForgotPasswordCodeUseCase.THRESHOLD[notificationType],
      },
    };

    await this.notificationQueue.add(noficationData);

    return DefaultResponse.ok;
  }

  private async generateVerificationCode(): Promise<string> {
    // Generate a 5-digit code
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
}
