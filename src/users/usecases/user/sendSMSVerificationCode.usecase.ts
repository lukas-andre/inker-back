import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainBadRule } from '../../../global/domain/exceptions/domainBadRule.exception';
import { DomainConflictException } from '../../../global/domain/exceptions/domainConflict.exception';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { SMSClient } from '../../../global/infrastructure/clients/sms.client';
import { UsersService } from '../../domain/services/users.service';
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
    private readonly usersService: UsersService,
    private readonly verificationHashService: VerificationHashService,
    private readonly smsClient: SMSClient,
    private readonly configService: ConfigService,
  ) {
    super(SendSMSVerificationCodeUseCase.name);
  }

  onModuleInit() {
    this.maxSmsTries = this.configService.get('verificationHash.maxSmsTries');
  }

  public async execute(userId: number, phoneNumber: string) {
    this.logger.log(`userId ${userId}`);

    const existUser = await this.usersService.findById(userId);
    this.logger.log({ existUser });
    if (!existUser) {
      return new DomainConflictException(`User don't exist`);
    }

    const verificationCode = this.generateVerificationCode();

    const isSmsAlreadySent = await this.verificationHashService.findOne({
      where: {
        userId: userId,
        verificationType: VerificationType.SMS,
      },
    });

    console.log({ isSmsAlreadySent });

    let verificationHash: VerificationHash | ServiceError;
    if (isSmsAlreadySent) {
      if (isSmsAlreadySent.tries >= this.maxSmsTries) {
        return new DomainBadRule('Max sms tries reached');
      }

      const verificationCode = this.generateVerificationCode();

      verificationHash = await this.verificationHashService.edit(
        isSmsAlreadySent.id,
        {
          ...isSmsAlreadySent,
          tries: ++isSmsAlreadySent.tries,
          hash: await this.verificationHashService.hashVerificationCode(
            verificationCode,
          ),
        },
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

    // const snsResult = await this.smsClient.sendSMS(phoneNumber, smsMessage);
    this.logger.log({ smsMessage });
  }

  // * This function return a random number between 1000 and 9999
  private generateVerificationCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }
}
