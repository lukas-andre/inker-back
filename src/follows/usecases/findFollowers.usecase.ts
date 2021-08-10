import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { UserType } from '../../users/domain/enums/userType.enum';
import { FollowersService } from '../domain/services/followers';
import { FollowedType } from '../domain/types/followedType';
import { UsersService } from '../../users/domain/services/users.service';
@Injectable()
export class FindFollowersUseCase extends BaseUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly followersService: FollowersService,
  ) {
    super(FindFollowersUseCase.name);
  }

  async execute(userId: number): Promise<FollowedType[] | DomainException> {
    let result: FollowedType[] | DomainException;

    if (!(await this.usersService.exists(userId))) {
      result = new DomainNotFoundException('User not found');
    }

    result = await this.followersService.findByKey({
      userType: UserType.ARTIST,
      userFollowedId: userId,
    });

    this.logger.log(
      `FindArtistFollowersUseCases result: ${JSON.stringify(result)}`,
    );
    return result;
  }
}
