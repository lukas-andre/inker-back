import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../global/domain/exceptions/domain.exception';
import { DomainBadRule } from '../../../global/domain/exceptions/domainBadRule.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponseHelper } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import { UsersService } from '../../domain/services/users.service';

@Injectable()
export class UpdateUserUsernameUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly usersService: UsersService) {
    super(UpdateUserUsernameUseCase.name);
  }

  public async execute(
    userId: number,
    newUsername: string,
  ): Promise<DomainException | DefaultResponseDto> {
    const usernameExists = await this.usersService.findOne({
      where: { username: newUsername },
    });

    if (usernameExists) {
      return new DomainBadRule('Username already used');
    }

    const user = await this.usersService.findById(userId);

    if (user.username === newUsername) {
      return new DomainBadRule('The username must be different');
    }

    user.username = newUsername;

    await this.usersService.save(user);

    return DefaultResponseHelper.ok;
  }
}
