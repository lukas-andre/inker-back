import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainBadRule } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { SMSClient } from '../../../global/infrastructure/clients/sms.client';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponseHelper } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import {
  MAX_SMS_ATTEMPTS_REACHED,
  USER_ALREADY_VERIFIED,
} from '../../domain/errors/codes';
import { UsersService } from '../../domain/services/users.service';
import { VerificationHashService } from '../../domain/services/verificationHash.service';
import {
  NotificationType,
  VerificationHash,
  VerificationType,
} from '../../infrastructure/entities/verificationHash.entity';

@Injectable()
export class SendSMSAccountVerificationCodeUseCase
  extends BaseUseCase
  implements UseCase, OnModuleInit
{
  private verificationType = VerificationType.ACTIVATE_ACCOUNT;
  private maxTries: number;

  constructor(
    private readonly verificationHashService: VerificationHashService,
    private readonly usersService: UsersService,
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
    userId: number,
    phoneNumber: string,
  ): Promise<DefaultResponseDto> {
    const userIsAlreadyVerified = await this.usersService.existsAndIsValid(
      userId,
    );

    if (userIsAlreadyVerified) {
      throw new DomainBadRule(USER_ALREADY_VERIFIED);
    }

    const verificationCode =
      this.verificationHashService.generateVerificationCode();

    this.logger.log({ verificationCode });

    const isSmsAlreadySent = await this.verificationHashService.findOne({
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
      await this.verificationHashService.create(
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

    return DefaultResponseHelper.ok;
  }

  private async generateNewValidationHash(
    previousHash: VerificationHash,
    verificationCode: string,
  ): Promise<VerificationHash> {
    return this.verificationHashService.edit(previousHash.id, {
      ...previousHash,
      tries: ++previousHash.tries,
      hash: await this.verificationHashService.hashVerificationCode(
        verificationCode,
      ),
    });
  }
}
