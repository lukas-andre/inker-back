import { Injectable, Logger } from '@nestjs/common';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { FollowerType } from '../domain/followerType';
import { ArtistsService } from '../domain/services/artists.service';
import { FollowersService } from '../domain/services/followers.service';

@Injectable()
export class FindArtistFollowersUseCase {
  private readonly logger = new Logger(FindArtistFollowersUseCase.name);

  constructor(
    private readonly artistsService: ArtistsService,
    private readonly followersService: FollowersService,
  ) {}

  async execute(artistId: number): Promise<FollowerType[] | DomainException> {
    let result: FollowerType[] | DomainException;

    if (!await this.artistsService.existArtist(artistId)) {
      result = new DomainNotFoundException('Artist not found');
    }

    result = await this.followersService.find({
      select: [
        'artistId',
        'fullname',
        'profileThumbnail',
        'userId',
        'userType',
        'userTypeId',
        'username',
      ],
      where: {
        artistId,
      },
    });
    this.logger.log(`FindArtistFollowersUseCases result: ${JSON.stringify(result)}`);
    return result;
  }
}
