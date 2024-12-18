import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMSClient } from '../../../../global/infrastructure/clients/sms.client';
import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../../global/infrastructure/helpers/defaultResponse.helper';
import { NotificationType } from '../../../infrastructure/entities/verificationHash.entity';
import { UsersProvider } from '../../../infrastructure/providers/users.provider';
import { VerificationHashProvider } from '../../../infrastructure/providers/verificationHash.service';
import { BaseSendVerificationUseCase } from './baseSendVerificationCode.usecase';
import { UseCase } from '../../../../global/domain/usecases/base.usecase';


@Injectable()
export class SendSMSVerificationCodeUseCase extends BaseSendVerificationUseCase implements UseCase, OnModuleInit {
  protected notificationType = NotificationType.SMS;

  constructor(
    verificationHashProvider: VerificationHashProvider,
    usersProvider: UsersProvider,
    private readonly smsClient: SMSClient,
    private readonly configService: ConfigService,
  ) {
    super(verificationHashProvider, usersProvider, SendSMSVerificationCodeUseCase.name);
  }

  onModuleInit() {
    this.maxTries = this.configService.get('verificationHash.accountVerification.sms.maxTries');
    this.logger.log(`Max SMS verification attempts: ${this.maxTries}`);
  }

  public async execute(phoneNumber: string): Promise<DefaultResponseDto> {
    const user = await this.findUser(phoneNumber, 'phone_number');
    this.validateUserStatus(user);

    const verificationCode = this.verificationHashProvider.generateVerificationCode();
    this.logger.log({ verificationCode });

    await this.handleVerificationHash(user.id, verificationCode);
    await this.sendSMSNotification(phoneNumber, verificationCode);

    return { ...DefaultResponse.ok, data: { userId: user.id } };
  }

  private async sendSMSNotification(phoneNumber: string, verificationCode: string): Promise<void> {
    const smsMessage = `Para activar su cuenta en Inker ingrese el siguiente code: ${verificationCode}`;
    const snsResult = await this.smsClient.sendSMS(phoneNumber, smsMessage);
    this.logger.log({ smsMessage, snsResult });
  }
}