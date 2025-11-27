import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UsersRepository } from '../../users/infrastructure/repositories/users.repository';
import { FollowingType } from '../domain/types/followingType';
import { FollowingsRepository } from '../infrastructure/database/followings.repository';
@Injectable()
export class FindFollowsUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly followingProvider: FollowingsRepository,
  ) {
    super(FindFollowsUseCase.name);
  }

  async execute(userId: string): Promise<FollowingType[]> {
    if (!(await this.usersRepository.exists(userId))) {
      throw new DomainNotFound('User not found');
    }

    const result = await this.followingProvider.findByKey({
      userFollowingId: userId,
    });
    this.logger.log(
      `FindArtistFollowsUseCase result: ${JSON.stringify(result)}`,
    );
    return result;
  }
}
