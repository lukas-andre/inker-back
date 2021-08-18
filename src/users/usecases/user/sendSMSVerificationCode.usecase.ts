import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DomainConflictException } from '../../../global/domain/exceptions/domainConflict.exception';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { SMSClient } from '../../../global/infrastructure/clients/sms.client';
import { UsersService } from '../../domain/services/users.service';
import { VerificationHashService } from '../../domain/services/verificationHash.service';
import { VerificationType } from '../../infrastructure/entities/verificationHash.entity';

@Injectable()
export class SendSMSVerificationCodeUseCase extends BaseUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationHashService: VerificationHashService,
    private readonly smsClient: SMSClient,
    private readonly configService: ConfigService,
  ) {
    super(SendSMSVerificationCodeUseCase.name);
  }

  public async execute(userId: number, phoneNumber: string) {
    this.logger.log(`userId ${userId}`);

    const existUser = await this.usersService.findById(userId);
    this.logger.log({ existUser });
    if (!existUser) {
      return new DomainConflictException(`User don't exist`);
    }

    const verificationCode = this.generateVerificationCode();

    let verificationHash = await this.verificationHashService.create(
      userId,
      verificationCode,
      VerificationType.SMS,
    );

    if (typeof verificationHash === 'number') {
      await this.verificationHashService.delete(verificationHash);

      const verificationCode = this.generateVerificationCode();

      const newVerificationHash = await this.verificationHashService.create(
        userId,
        verificationCode,
        VerificationType.SMS,
      );

      verificationHash = newVerificationHash;
    }

    if (verificationHash instanceof ServiceError) {
      return new DomainConflictException(
        this.handleServiceError(verificationHash),
      );
    }

    const smsMessage = `Ingrese ${verificationCode} para activar su cuenta en Inker`;

    const snsResult = await this.smsClient.sendSMS(phoneNumber, smsMessage);
    this.logger.log({ snsResult });
  }

  private generateVerificationCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }
}
