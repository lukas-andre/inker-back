import { Injectable } from '@nestjs/common';
import stringify from 'fast-safe-stringify';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { UsersRepository } from '../../users/infrastructure/repositories/users.repository';
import { FollowedType } from '../domain/types/followedType';
import { FollowedsRepository } from '../infrastructure/database/followeds.repository';
@Injectable()
export class FindFollowersUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly followedsProvider: FollowedsRepository,
  ) {
    super(FindFollowersUseCase.name);
  }

  async execute(userId: string): Promise<FollowedType[]> {
    if (!(await this.usersRepository.exists(userId))) {
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
