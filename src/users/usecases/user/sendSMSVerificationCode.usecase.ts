import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainException } from '../../../global/domain/exceptions/domain.exception';
import { DomainBadRule } from '../../../global/domain/exceptions/domainBadRule.exception';
import { DomainConflictException } from '../../../global/domain/exceptions/domainConflict.exception';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { SMSClient } from '../../../global/infrastructure/clients/sms.client';
import {
  DefaultResponseDto,
  DefaultResponseStatus,
} from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { VerificationHashService } from '../../domain/services/verificationHash.service';
import {
  VerificationHash,
  VerificationType,
} from '../../infrastructure/entities/verificationHash.entity';

@Injectable()
export class SendSMSVerificationCodeUseCase
  extends BaseUseCase
  implements OnModuleInit
{
  private maxSmsTries: number;

  constructor(
    private readonly verificationHashService: VerificationHashService,
    private readonly smsClient: SMSClient,
    private readonly configService: ConfigService,
  ) {
    super(SendSMSVerificationCodeUseCase.name);
  }

  onModuleInit() {
    this.maxSmsTries = this.configService.get('verificationHash.maxSMSTries');
    this.logger.log(`maxSmsTries ${this.maxSmsTries}`);
  }

  public async execute(
    userId: number,
    phoneNumber: string,
  ): Promise<DefaultResponseDto | DomainException> {
    this.logger.log(`userId ${userId}`);

    const isSmsAlreadySent = await this.verificationHashService.findOne({
      where: {
        userId: userId,
        verificationType: VerificationType.SMS,
      },
    });
    this.logger.log({ isSmsAlreadySent });

    const verificationCode = this.generateVerificationCode();
    this.logger.log({ verificationCode });

    let verificationHash: VerificationHash | ServiceError;
    if (isSmsAlreadySent) {
      if (isSmsAlreadySent.tries >= this.maxSmsTries) {
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
        VerificationType.SMS,
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

    return { status: DefaultResponseStatus.OK };
  }

  private async generateNewValidationHash(
    oldHash: VerificationHash,
    verificationCode: string,
  ): Promise<VerificationHash | ServiceError> {
    return this.verificationHashService.edit(oldHash.id, {
      ...oldHash,
      tries: ++oldHash.tries,
      hash: await this.verificationHashService.hashVerificationCode(
        verificationCode,
      ),
    });
  }

  // * This function return a random number between 1000 and 9999
  private generateVerificationCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }
}
