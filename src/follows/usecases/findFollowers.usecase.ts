import { Injectable, Logger } from '@nestjs/common';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { UserType } from '../../users/domain/enums/userType.enum';
import { FollowedsService } from '../domain/services/followeds.service';
import { FollowedType } from '../domain/types/followedType';
import { UsersService } from '../../users/domain/services/users.service';

@Injectable()
export class FindFollowersUseCase {
  private readonly logger = new Logger(FindFollowersUseCase.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly followedsService: FollowedsService,
  ) {}

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
