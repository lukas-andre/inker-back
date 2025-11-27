import { Injectable } from '@nestjs/common';

import {
  DomainBadRule,
  DomainConflict,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import {
  NotificationType,
  VerificationType,
} from '../../infrastructure/entities/verificationHash.entity';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { VerificationHashRepository } from '../../infrastructure/repositories/verificationHash.repository';

@Injectable()
export class UpdateUserPasswordUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly verificationHashRepository: VerificationHashRepository,
  ) {
    super(UpdateUserPasswordUseCase.name);
  }

  public async execute(
    userId: string,
    code: string,
    notificationType: NotificationType,
    password: string,
    newPassword: string,
  ): Promise<DefaultResponseDto> {
    if (password !== newPassword) {
      throw new DomainBadRule('Password must match');
    }

    const userHash = await this.verificationHashRepository.findOne({
      where: {
        userId: userId,
        notificationType: notificationType,
        verificationType: VerificationType.FORGOT_PASSWORD,
      },
    });

    this.logger.log({ userHash });

    if (!userHash) {
      throw new DomainBadRule(`Hash for userId ${userId} not found`);
    }

    const isValidCode =
      await this.verificationHashRepository.validateVerificationCode(
        code,
        userHash.hash,
      );

    this.logger.log({ isValidCode });

    if (!isValidCode) {
      throw new DomainConflict('Invalid code');
    }

    await this.usersRepository.edit(userId, {
      password: await this.usersRepository.hashPassword(newPassword),
    });

    return { ...DefaultResponse.ok, data: 'Password updated!' };
  }
}
