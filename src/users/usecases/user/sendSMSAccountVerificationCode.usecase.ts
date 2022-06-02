import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainException } from '../../../global/domain/exceptions/domain.exception';
import { DomainBadRule } from '../../../global/domain/exceptions/domainBadRule.exception';
import { DomainConflictException } from '../../../global/domain/exceptions/domainConflict.exception';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { SMSClient } from '../../../global/infrastructure/clients/sms.client';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponseHelper } from '../../../global/infrastructure/helpers/defaultResponse.helper';
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
  ): Promise<DefaultResponseDto | DomainException> {
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

    let verificationHash: VerificationHash | ServiceError;
    if (isSmsAlreadySent) {
      if (isSmsAlreadySent.tries >= this.maxTries) {
        return new DomainBadRule('Max sms tries reached');
      }
      verificationHash = await this.generateNewValidationHash(
        isSmsAlreadySent,
        verificationCode,
      );
    } else {
      verificationHash = await this.verificationHashService.create(
        userId,
        verificationCode,
        NotificationType.SMS,
        this.verificationType,
        1,
      );
    }

    if (verificationHash instanceof ServiceError) {
      return new DomainConflictException(
        this.handleServiceError(verificationHash),
      );
    }

    const smsMessage = `Ingrese ${verificationCode} para activar su cuenta en Inker`;

    const snsResult = await this.smsClient.sendSMS(phoneNumber, smsMessage);
    this.logger.log({ smsMessage });
    this.logger.log({ snsResult });

    return DefaultResponseHelper.ok;
  }

  private async generateNewValidationHash(
    previousHash: VerificationHash,
    verificationCode: string,
  ): Promise<VerificationHash | ServiceError> {
    return this.verificationHashService.edit(previousHash.id, {
      ...previousHash,
      tries: ++previousHash.tries,
      hash: await this.verificationHashService.hashVerificationCode(
        verificationCode,
      ),
    });
  }
}
