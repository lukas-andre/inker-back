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

@Injectable()
export class DeleteUserUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly usersRepository: UsersRepository) {
    super(DeleteUserUseCase.name);
  }

  public async execute(
    userId: string,
    password: string,
  ): Promise<DefaultResponseDto> {
    const user = await this.usersRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new DomainBadRule('User not found');
    }

    const isValidPassword = await this.usersRepository.validatePassword(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new DomainBadRule('Invalid password');
    }

    try {
      await this.usersRepository.softDelete(userId);
    } catch (error) {
      this.logger.error('Error deleting user', error);
      throw new DomainConflict('Unable to delete user');
    }

    return DefaultResponse.ok;
  }
}
