import { Injectable } from '@nestjs/common';

import { SearchArtistDto } from '../infrastructure/dtos/searchArtist.dto';
import { ArtistProvider } from '../infrastructure/database/artist.provider';
import { FollowedsProvider } from '../../follows/infrastructure/database/followeds.provider';
import { FollowingsProvider } from '../../follows/infrastructure/database/followings.provider';

@Injectable()
export class FindArtistsUsecase {
  constructor(
    private readonly artistProvider: ArtistProvider,
    private readonly followedsProvider: FollowedsProvider,
    private readonly followingProvider: FollowingsProvider,
  ) {}

  async execute(searchParams: SearchArtistDto) {
    const result = await this.artistProvider.searchArtists(searchParams);

    const artistsWithFollowersAndFollowings = await Promise.all(
      result.artists.map(async artist => {
        const [followers, follows] = await Promise.all([
          this.followedsProvider.countFollowers(artist.userId),
          this.followingProvider.countFollows(artist.userId),
        ]);

        return {
          ...artist,
          followers,
          follows,
        };
      }),
    );

    return {
      artists: artistsWithFollowersAndFollowings,
      meta: result.meta,
    };
  }
}
