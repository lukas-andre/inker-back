import { Injectable } from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { FollowersService } from '../domain/services/followers.service';

@Injectable()
export class FindArtistFollowersUseCases {
  constructor(private readonly artistsService: ArtistsService, private readonly followersService: FollowersService) {}

  async execute(artistId: string) {

  }
}
