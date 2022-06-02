import { Injectable } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UsersService } from '../../users/domain/services/users.service';
import { FollowingsService } from '../domain/services/followings.service';
import { FollowingType } from '../domain/types/followingType';
@Injectable()
export class FindFollowsUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly followingService: FollowingsService,
  ) {
    super(FindFollowsUseCase.name);
  }

  async execute(userId: number): Promise<FollowingType[] | DomainException> {
    let result: FollowingType[] | DomainException;

    if (!(await this.usersService.exists(userId))) {
      result = new DomainNotFoundException('User not found');
    }

    result = await this.followingService.findByKey({ userFollowingId: userId });
    this.logger.log(
      `FindArtistFollowsUseCase result: ${JSON.stringify(result)}`,
    );
    return result;
  }
}
