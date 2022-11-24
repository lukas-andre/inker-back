import { Injectable } from '@nestjs/common';

import { DomainBadRule } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import { UsersService } from '../../domain/services/users.service';

@Injectable()
export class UpdateUserUsernameUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly usersService: UsersService) {
    super(UpdateUserUsernameUseCase.name);
  }

  public async execute(
    userId: number,
    newUsername: string,
  ): Promise<DefaultResponseDto> {
    // TODO: Replace with efficient query
    const usernameExists = await this.usersService.findOne({
      where: { username: newUsername },
    });

    if (usernameExists) {
      throw new DomainBadRule('Username already used');
    }

    const user = await this.usersService.findById(userId);

    if (user.username === newUsername) {
      throw new DomainBadRule('The username must be different');
    }

    user.username = newUsername;

    await this.usersService.save(user);

    return DefaultResponse.ok;
  }
}
