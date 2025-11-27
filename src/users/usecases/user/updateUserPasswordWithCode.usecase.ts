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
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { VerificationHashRepository } from '../../infrastructure/repositories/verificationHash.repository';

@Injectable()
export class UpdateUserPasswordWithCodeUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly verificationHashRepository: VerificationHashRepository,
  ) {
    super(UpdateUserPasswordWithCodeUseCase.name);
  }

  public async execute(
    code: string,
    email: string,
    password: string,
    newPassword: string,
  ): Promise<DefaultResponseDto> {
    if (password !== newPassword) {
      throw new DomainBadRule('Password must match');
    }

    const userHash = await this.verificationHashRepository.findOne({
      where: {
        email,
      },
    });

    this.logger.log({ userHash });

    if (!userHash) {
      throw new DomainBadRule(`Hash for code ${code} not found`);
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

    await this.usersRepository.edit(userHash.userId, {
      password: await this.usersRepository.hashPassword(newPassword),
    });

    await this.verificationHashRepository.delete(userHash.id);

    return { ...DefaultResponse.ok, data: 'Password updated!' };
  }
}
