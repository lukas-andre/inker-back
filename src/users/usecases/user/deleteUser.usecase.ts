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
import {
  userQueries,
  UsersProvider,
} from '../../infrastructure/providers/users.provider';

@Injectable()
export class DeleteUserUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly usersProvider: UsersProvider) {
    super(DeleteUserUseCase.name);
  }

  public async execute(
    userId: number,
    password: string,
  ): Promise<DefaultResponseDto> {
    const [{ user }] = await this.usersProvider.source.query(
      userQueries.findByIdWithPassword,
      [userId],
    );

    if (!user) {
      throw new DomainBadRule('User not found');
    }

    const isValidPassword = await this.usersProvider.validatePassword(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new DomainBadRule('Invalid password');
    }

    try {
      await this.usersProvider.softDelete(userId);
    } catch (error) {
      this.logger.error('Error deleting user', error);
      throw new DomainConflict('Unable to delete user');
    }

    return DefaultResponse.ok;
  }
}
