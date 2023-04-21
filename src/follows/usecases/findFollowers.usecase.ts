import { Injectable } from '@nestjs/common';
import stringify from 'fast-safe-stringify';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { UsersProvider } from '../../users/infrastructure/providers/users.provider';
import { FollowedType } from '../domain/types/followedType';
import { FollowedsProvider } from '../infrastructure/database/followeds.provider';
@Injectable()
export class FindFollowersUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersProvider: UsersProvider,
    private readonly followedsProvider: FollowedsProvider,
  ) {
    super(FindFollowersUseCase.name);
  }

  async execute(userId: number): Promise<FollowedType[]> {
    if (!(await this.usersProvider.exists(userId))) {
      throw new DomainNotFound('User not found');
    }

    const result = await this.followedsProvider.findByKey({
      userType: UserType.ARTIST,
      userFollowedId: userId,
    });

    this.logger.log(`FindArtistFollowersUseCases result: ${stringify(result)}`);
    return result;
  }
}
