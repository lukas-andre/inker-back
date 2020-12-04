import { Injectable, Logger } from '@nestjs/common';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { ArtistsService } from '../domain/services/artists.service';
import { FollowsService } from '../domain/services/follows.service';
import { FollowType } from '../domain/followType';

@Injectable()
export class FindArtistFollowsUseCase {
  private readonly logger = new Logger(FindArtistFollowsUseCase.name);

  constructor(
    private readonly artistsService: ArtistsService,
    private readonly followsService: FollowsService,
  ) {}

  async execute(artistUserId: number): Promise<FollowType[] | DomainException> {
    let result: FollowType[] | DomainException;

    if (!(await this.artistsService.existArtistByUserId(artistUserId))) {
      result = new DomainNotFoundException('Artist not found');
    }

    result = await this.followsService.findByKey({ followerUserId: artistUserId });
    this.logger.log(
      `FindArtistFollowsUseCase result: ${JSON.stringify(result)}`,
    );
    return result;
  }
}
