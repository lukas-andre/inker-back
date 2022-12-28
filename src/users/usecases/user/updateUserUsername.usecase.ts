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
export class UpdateUserUsernameUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly usersProvider: UsersProvider) {
    super(UpdateUserUsernameUseCase.name);
  }

  public async execute(
    userId: number,
    newUsername: string,
  ): Promise<DefaultResponseDto> {
    // TODO: Replace with efficient query
    const usernameExists = await this.usersProvider.findOne({
      where: { username: newUsername },
    });

    if (usernameExists) {
      throw new DomainBadRule('Username already used');
    }

    const user = await this.usersProvider.findById(userId);

    if (user.username === newUsername) {
      throw new DomainBadRule('The username must be different');
    }

    user.username = newUsername;

    await this.usersProvider.save(user);

    return DefaultResponse.ok;
  }
}
