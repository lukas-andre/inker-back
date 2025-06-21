import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import {
  DomainBadRequest,
  DomainBadRule,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import { UseCase } from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import { SendVerificationCodeJobType } from '../../../queues/notifications/domain/schemas/codes';
import { queues } from '../../../queues/queues';
import { SendForgotPasswordCodeReqDto } from '../../infrastructure/dtos/sendForgotPasswordCodeReq.dto';
import { User } from '../../infrastructure/entities/user.entity';
import {
  NotificationType,
  VerificationType,
} from '../../infrastructure/entities/verificationHash.entity';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { VerificationHashRepository } from '../../infrastructure/repositories/verificationHash.repository';

export class SendForgotPasswordCodeUseCase implements UseCase {
  static readonly THRESHOLD: Record<NotificationType, number> = {
    [NotificationType.SMS]: 3,
    [NotificationType.EMAIL]: 10,
  };

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly verificationHashRepository: VerificationHashRepository,
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
      user = await this.usersRepository.findOne({ where: { email } });
    } else if (phoneNumber) {
      user = await this.usersRepository.findOne({ where: { phoneNumber } });
    }

    if (!user) {
      throw new DomainNotFound('User not found');
    }

    const verificationCode = await this.generateVerificationCode();

    const notificationType = email
      ? NotificationType.EMAIL
      : NotificationType.SMS;
    const verificationType = VerificationType.FORGOT_PASSWORD;

    const existingHash = await this.verificationHashRepository.findOne({
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
      await this.verificationHashRepository.edit(existingHash.id, {
        tries: existingHash.tries + 1,
        hash: await this.verificationHashRepository.hashVerificationCode(
          verificationCode,
        ),
      });
    } else {
      await this.verificationHashRepository.create(
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
