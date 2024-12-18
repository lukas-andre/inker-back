import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../../global/infrastructure/helpers/defaultResponse.helper';
import { AccountVerificationCodeType, MailIdSchema } from '../../../../notifications/services/email/schemas/email';
import { queues } from '../../../../queues/queues';
import { NotificationType } from '../../../infrastructure/entities/verificationHash.entity';
import { UsersProvider } from '../../../infrastructure/providers/users.provider';
import { VerificationHashProvider } from '../../../infrastructure/providers/verificationHash.service';
import { BaseSendVerificationUseCase } from './baseSendVerificationCode.usecase';
import { UseCase } from '../../../../global/domain/usecases/base.usecase';
import { SendVerificationCodeJobType } from '../../../../queues/notifications/domain/schemas/codes';
import { User } from '../../../infrastructure/entities/user.entity';


@Injectable()
export class SendEmailVerificationCodeUseCase extends BaseSendVerificationUseCase implements UseCase, OnModuleInit {
  protected notificationType = NotificationType.EMAIL;

  constructor(
    verificationHashProvider: VerificationHashProvider,
    usersProvider: UsersProvider,
    private readonly configService: ConfigService,
    @InjectQueue(queues.notification.name)
    private readonly notificationsQueue: Queue,
  ) {
    super(verificationHashProvider, usersProvider, SendEmailVerificationCodeUseCase.name);
  }

  onModuleInit() {
    this.maxTries = this.configService.get('verificationHash.accountVerification.email.maxTries');
    this.logger.log(`Max email verification attempts: ${this.maxTries}`);
  }

  public async execute(email: string): Promise<DefaultResponseDto> {
    const user = await this.findUser(email, 'email');
    this.validateUserStatus(user);

    const verificationCode = this.verificationHashProvider.generateVerificationCode();
    this.logger.log({ verificationCode });

    await this.handleVerificationHash(user.id, verificationCode);
    await this.sendEmailNotification(user, verificationCode);

    return { ...DefaultResponse.ok, data: { userId: user.id } };
  }

  private async sendEmailNotification(user: User, verificationCode: string): Promise<void> {
    const emailData: SendVerificationCodeJobType = {
      jobId: 'ACCOUNT_VERIFICATION_CODE',
      notificationTypeId: 'EMAIL',
      metadata: {
        email: user.email,
        code: verificationCode,
        expirationTime: 10,
      },
    };

    await this.notificationsQueue.add(emailData);
  }
}