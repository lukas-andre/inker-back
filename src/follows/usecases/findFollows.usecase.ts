import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UsersProvider } from '../../users/infrastructure/providers/users.provider';
import { FollowingType } from '../domain/types/followingType';
import { FollowingsProvider } from '../infrastructure/database/followings.provider';
@Injectable()
export class FindFollowsUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersProvider: UsersProvider,
    private readonly followingProvider: FollowingsProvider,
  ) {
    super(FindFollowsUseCase.name);
  }

  async execute(userId: number): Promise<FollowingType[]> {
    if (!(await this.usersProvider.exists(userId))) {
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
