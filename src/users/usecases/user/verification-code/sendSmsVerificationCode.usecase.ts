import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMSClient } from '../../../../global/infrastructure/clients/sms.client';
import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../../global/infrastructure/helpers/defaultResponse.helper';
import { NotificationType } from '../../../infrastructure/entities/verificationHash.entity';
import { BaseSendVerificationUseCase } from './baseSendVerificationCode.usecase';
import { UseCase } from '../../../../global/domain/usecases/base.usecase';
import { VerificationHashRepository } from '../../../infrastructure/repositories/verificationHash.repository';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

@Injectable()
export class SendSMSVerificationCodeUseCase
  extends BaseSendVerificationUseCase
  implements UseCase, OnModuleInit
{
  protected notificationType = NotificationType.SMS;

  constructor(
    verificationHashRepository: VerificationHashRepository,
    usersRepository: UsersRepository,
    private readonly smsClient: SMSClient,
    private readonly configService: ConfigService,
  ) {
    super(
      verificationHashRepository,
      usersRepository,
      SendSMSVerificationCodeUseCase.name,
    );
  }

  onModuleInit() {
    this.maxTries = this.configService.get(
      'verificationHash.accountVerification.sms.maxTries',
    );
    this.logger.log(`Max SMS verification attempts: ${this.maxTries}`);
  }

  public async execute(phoneNumber: string): Promise<DefaultResponseDto> {
    const user = await this.findUser(phoneNumber, 'phone_number');
    this.validateUserStatus(user);

    const verificationCode =
      this.verificationHashRepository.generateVerificationCode();
    this.logger.log({ verificationCode });

    await this.handleVerificationHash(user.id, verificationCode);
    await this.sendSMSNotification(phoneNumber, verificationCode);

    return { ...DefaultResponse.ok, data: { userId: user.id } };
  }

  private async sendSMSNotification(
    phoneNumber: string,
    verificationCode: string,
  ): Promise<void> {
    const smsMessage = `Para activar su cuenta en Inker ingrese el siguiente code: ${verificationCode}`;
    const snsResult = await this.smsClient.sendSMS(phoneNumber, smsMessage);
    this.logger.log({ smsMessage, snsResult });
  }
}
