import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { UserType } from '../../users/domain/enums/userType.enum';
import { FollowedsService } from '../domain/services/followeds.service';
import { FollowedType } from '../domain/types/followedType';
import { UsersService } from '../../users/domain/services/users.service';
@Injectable()
export class FindFollowersUseCase extends BaseUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly followedsService: FollowedsService,
  ) {
    super(FindFollowersUseCase.name);
  }

  async execute(userId: number): Promise<FollowedType[] | DomainException> {
    let result: FollowedType[] | DomainException;

    if (!(await this.usersService.exists(userId))) {
      result = new DomainNotFoundException('User not found');
    }

    result = await this.followedsService.findByKey({
      userType: UserType.ARTIST,
      userFollowedId: userId,
    });

    this.logger.log(
      `FindArtistFollowersUseCases result: ${JSON.stringify(result)}`,
    );
    return result;
  }
}
