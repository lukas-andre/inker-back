import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../../global/domain/exceptions/domainConflict.exception';
import { DomainNotFoundException } from '../../../global/domain/exceptions/domainNotFound.exception';
import { UnprocessableDomainException } from '../../../global/domain/exceptions/unprocessableDomain.exception';
import { isServiceError } from '../../../global/domain/guards/isServiceError.guard';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import {
  DefaultResponseDto,
  DefaultResponseStatus,
} from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { UsersService } from '../../domain/services/users.service';
import { VerificationHashService } from '../../domain/services/verificationHash.service';
import { VerificationType } from '../../infrastructure/entities/verificationHash.entity';

@Injectable()
export class ValidateSMSVerificationCodeUseCase extends BaseUseCase {
  constructor(
    private readonly verificationHashService: VerificationHashService,
    private readonly usersService: UsersService,
  ) {
    super(ValidateSMSVerificationCodeUseCase.name);
  }

  public async execute(
    userId: number,
    code: string,
  ): Promise<DomainException | DefaultResponseDto> {
    this.logger.log(`userId ${userId}`);

    const userHash = await this.verificationHashService.findOne({
      where: {
        userId: userId,
        verificationType: VerificationType.SMS,
      },
    });
    this.logger.log({ userHash });

    if (!userHash) {
      return new DomainNotFoundException(`Hash for userId ${userId} not found`);
    }

    const isValidCode =
      await this.verificationHashService.validateVerificationCode(
        code,
        userHash.hash,
      );
    this.logger.log({ isValidCode });

    if (!isValidCode) {
      return new DomainConflictException('Invalid code');
    }

    const activateUserResult = await this.usersService.activate(userId);
    this.logger.log({ activateUserResult });

    if (isServiceError(activateUserResult)) {
      return new UnprocessableDomainException(
        this.handleServiceError(activateUserResult),
      );
    }

    if (activateUserResult.affected >= 1) {
      await this.verificationHashService.delete(userHash.id);
    }

    return {
      status: DefaultResponseStatus.OK,
    };
  }
}
