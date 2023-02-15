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
import { UsersProvider } from '../../infrastructure/providers/users.provider';
import { VerificationHashProvider } from '../../infrastructure/providers/verificationHash.service';

@Injectable()
export class UpdateUserPasswordUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersProvider: UsersProvider,
    private readonly verificationHashProvider: VerificationHashProvider,
  ) {
    super(UpdateUserPasswordUseCase.name);
  }

  public async execute(
    userId: number,
    code: string,
    notificationType: NotificationType,
    password: string,
    newPassword: string,
  ): Promise<DefaultResponseDto> {
    if (password !== newPassword) {
      throw new DomainBadRule('Password must match');
    }

    const userHash = await this.verificationHashProvider.findOne({
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
      await this.verificationHashProvider.validateVerificationCode(
        code,
        userHash.hash,
      );

    this.logger.log({ isValidCode });

    if (!isValidCode) {
      throw new DomainConflict('Invalid code');
    }

    await this.usersProvider.edit(userId, {
      password: await this.usersProvider.hashPassword(newPassword),
    });

    return { ...DefaultResponse.ok, data: 'Password updated!' };
  }
}
