import { Injectable } from '@nestjs/common';

import { DomainBadRule } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import { UsersProvider } from '../../infrastructure/providers/users.provider';

@Injectable()
export class UpdateUserEmailUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly usersProvider: UsersProvider) {
    super(UpdateUserEmailUseCase.name);
  }

  public async execute(
    userId: number,
    newEmail: string,
  ): Promise<DefaultResponseDto> {
    const emailExists = await this.usersProvider.findOne({
      where: { email: newEmail },
    });

    if (emailExists) {
      throw new DomainBadRule('Email already used');
    }

    const user = await this.usersProvider.findById(userId);

    if (user.email === newEmail) {
      throw new DomainBadRule('The emails must be different');
    }

    user.email = newEmail;

    await this.usersProvider.save(user);

    // TODO: send email to verify his new email

    return DefaultResponse.ok;
  }
}
