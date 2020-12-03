import { Injectable } from '@nestjs/common';
import { DomainNotFoundException } from 'src/global/domain/exceptions/domainNotFound.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { ArtistType } from '../domain/artistType';
import { FollowerType } from '../domain/followerType';
import { ArtistsService } from '../domain/services/artists.service';
import { FollowersService } from '../domain/services/followers.service';

@Injectable()
export class FindArtistFollowersUseCases {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly followersService: FollowersService,
  ) {}

  async execute(artistId: number): Promise<any | DomainException> {
    let result: FollowerType[] | DomainException;
    const exists = await this.artistsService.existArtist(artistId);

    if (!exists) return new DomainNotFoundException('Artist not found');

    result = await this.followersService.find({
      where: {
        artistId
      }
    })

    return result;
  }
}
