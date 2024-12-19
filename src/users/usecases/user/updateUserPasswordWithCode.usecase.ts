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
import { UsersProvider } from '../../infrastructure/providers/users.provider';
import { VerificationHashProvider } from '../../infrastructure/providers/verificationHash.service';

@Injectable()
export class UpdateUserPasswordWithCodeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersProvider: UsersProvider,
    private readonly verificationHashProvider: VerificationHashProvider,
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

    const userHash = await this.verificationHashProvider.findOne({
      where: {
        email
      },
    });

    this.logger.log({ userHash });

    if (!userHash) {
      throw new DomainBadRule(`Hash for code ${code} not found`);
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

    await this.usersProvider.edit(userHash.userId, {
      password: await this.usersProvider.hashPassword(newPassword),
    });

    await this.verificationHashProvider.delete(userHash.id);

    return { ...DefaultResponse.ok, data: 'Password updated!' };
  }
}
