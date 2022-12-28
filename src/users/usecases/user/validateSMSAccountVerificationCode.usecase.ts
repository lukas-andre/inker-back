import { Injectable } from '@nestjs/common';

import {
  DomainBadRule,
  DomainConflict,
  DomainException,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import {
  HASH_NOT_FOUND_FOR_USER_ID,
  INVALID_VERIFICATION_CODE,
  USER_ALREADY_VERIFIED,
} from '../../domain/errors/codes';
import {
  NotificationType,
  VerificationType,
} from '../../infrastructure/entities/verificationHash.entity';
import { UsersProvider } from '../../infrastructure/providers/users.provider';
import { VerificationHashProvider } from '../../infrastructure/providers/verificationHash.service';

@Injectable()
export class ValidateSMSAccountVerificationCodeUseCase
  extends BaseUseCase
  implements UseCase
{
  private verificationType = VerificationType.ACTIVATE_ACCOUNT;

  constructor(
    private readonly verificationHashProvider: VerificationHashProvider,
    private readonly usersProvider: UsersProvider,
  ) {
    super(ValidateSMSAccountVerificationCodeUseCase.name);
  }

  public async execute(
    userId: number,
    code: string,
  ): Promise<DomainException | DefaultResponseDto> {
    this.logger.log(`userId ${userId}`);
    const userIsAlreadyVerified = await this.usersProvider.existsAndIsActive(
      userId,
    );

    if (userIsAlreadyVerified) {
      throw new DomainBadRule(USER_ALREADY_VERIFIED);
    }

    const userHash = await this.verificationHashProvider.findOne({
      where: {
        userId: userId,
        notificationType: NotificationType.SMS,
        verificationType: this.verificationType,
      },
    });
    this.logger.log({ userHash });

    if (!userHash) {
      throw new DomainNotFound(`${HASH_NOT_FOUND_FOR_USER_ID} ${userId}`);
    }

    const isValidCode =
      await this.verificationHashProvider.validateVerificationCode(
        code,
        userHash.hash,
      );
    this.logger.log({ isValidCode });

    if (!isValidCode) {
      throw new DomainConflict(INVALID_VERIFICATION_CODE);
    }

    // TODO: - this should be done in a transaction
    const activateUserResult = await this.usersProvider.activate(userId);
    this.logger.log({ activateUserResult });
    if (activateUserResult.affected >= 1) {
      await this.verificationHashProvider.delete(userHash.id);
    }

    return DefaultResponse.ok;
  }
}
