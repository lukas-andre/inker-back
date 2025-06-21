import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DomainBadRule } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { SMSClient } from '../../../global/infrastructure/clients/sms.client';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import {
  MAX_SMS_ATTEMPTS_REACHED,
  USER_ALREADY_VERIFIED,
} from '../../domain/errors/codes';
import {
  NotificationType,
  VerificationHash,
  VerificationType,
} from '../../infrastructure/entities/verificationHash.entity';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { VerificationHashRepository } from '../../infrastructure/repositories/verificationHash.repository';

@Injectable()
export class SendSMSAccountVerificationCodeUseCase
  extends BaseUseCase
  implements UseCase, OnModuleInit
{
  private verificationType = VerificationType.ACTIVATE_ACCOUNT;
  private maxTries: number;

  constructor(
    private readonly verificationHashRepository: VerificationHashRepository,
    private readonly usersRepository: UsersRepository,
    private readonly smsClient: SMSClient,
    private readonly configService: ConfigService,
  ) {
    super(SendSMSAccountVerificationCodeUseCase.name);
  }

  onModuleInit() {
    this.maxTries = this.configService.get(
      'verificationHash.accountVerification.sms.maxTries',
    );
    this.logger.log(`maxSmsTries ${this.maxTries}`);
  }

  public async execute(
    userId: string,
    phoneNumber: string,
  ): Promise<DefaultResponseDto> {
    const userIsAlreadyVerified = await this.usersRepository.existsAndIsActive(
      userId,
    );

    if (userIsAlreadyVerified) {
      throw new DomainBadRule(USER_ALREADY_VERIFIED);
    }

    const verificationCode =
      this.verificationHashRepository.generateVerificationCode();

    this.logger.log({ verificationCode });

    const isSmsAlreadySent = await this.verificationHashRepository.findOne({
      where: {
        userId: userId,
        notificationType: NotificationType.SMS,
        verificationType: this.verificationType,
      },
    });
    this.logger.log({ isSmsAlreadySent });

    if (isSmsAlreadySent) {
      if (isSmsAlreadySent.tries >= this.maxTries) {
        throw new DomainBadRule(MAX_SMS_ATTEMPTS_REACHED);
      }
      await this.generateNewValidationHash(isSmsAlreadySent, verificationCode);
    } else {
      await this.verificationHashRepository.create(
        userId,
        verificationCode,
        NotificationType.SMS,
        this.verificationType,
        1,
      );
    }

    const smsMessage = `Para activar su cuenta en Inker ingrese el siguiente code: ${verificationCode} `;

    const snsResult = await this.smsClient.sendSMS(phoneNumber, smsMessage);
    this.logger.log({ smsMessage });
    this.logger.log({ snsResult });

    return DefaultResponse.ok;
  }

  private async generateNewValidationHash(
    previousHash: VerificationHash,
    verificationCode: string,
  ): Promise<VerificationHash> {
    return this.verificationHashRepository.edit(previousHash.id, {
      ...previousHash,
      tries: ++previousHash.tries,
      hash: await this.verificationHashRepository.hashVerificationCode(
        verificationCode,
      ),
    });
  }
}
