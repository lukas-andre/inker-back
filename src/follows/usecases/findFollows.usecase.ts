import { Injectable, Logger } from '@nestjs/common';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { UsersService } from '../../users/domain/services/users.service';
import { FollowingsService } from '../domain/services/followings.service';
import { FollowingType } from '../domain/types/followingType';

@Injectable()
export class FindFollowsUseCase {
  private readonly logger = new Logger(FindFollowsUseCase.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly followingService: FollowingsService,
  ) {}

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
