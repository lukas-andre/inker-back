import { Injectable } from '@nestjs/common';
import stringify from 'fast-safe-stringify';
import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { UsersService } from '../../users/domain/services/users.service';
import { FollowedsService } from '../domain/services/followeds.service';
import { FollowedType } from '../domain/types/followedType';
@Injectable()
export class FindFollowersUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly followedsService: FollowedsService,
  ) {
    super(FindFollowersUseCase.name);
  }

  async execute(userId: number): Promise<FollowedType[]> {
    if (!(await this.usersService.exists(userId))) {
      throw new DomainNotFound('User not found');
    }

    const result = await this.followedsService.findByKey({
      userType: UserType.ARTIST,
      userFollowedId: userId,
    });

    this.logger.log(`FindArtistFollowersUseCases result: ${stringify(result)}`);
    return result;
  }
}
