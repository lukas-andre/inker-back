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
import { DefaultResponseHelper } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import { UsersService } from '../../domain/services/users.service';
import { VerificationHashService } from '../../domain/services/verificationHash.service';
import {
  NotificationType,
  VerificationType,
} from '../../infrastructure/entities/verificationHash.entity';

@Injectable()
export class UpdateUserPasswordUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationHashService: VerificationHashService,
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

    const userHash = await this.verificationHashService.findOne({
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
      await this.verificationHashService.validateVerificationCode(
        code,
        userHash.hash,
      );

    this.logger.log({ isValidCode });

    if (!isValidCode) {
      throw new DomainConflict('Invalid code');
    }

    await this.usersService.edit(userId, {
      password: await this.usersService.hashPassword(newPassword),
    });

    return { ...DefaultResponseHelper.ok, data: 'Password updated!' };
  }
}
