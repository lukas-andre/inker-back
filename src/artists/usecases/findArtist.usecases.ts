import { Injectable } from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { FindManyOptions } from 'typeorm';
import { FollowersService } from '../domain/services/followers.service';
import { ArtistType } from '../domain/artistType';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { FollowsService } from '../domain/services/follows.service';

@Injectable()
export class FindArtistsUseCases {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly followersService: FollowersService,
    private readonly followsService: FollowsService,
  ) {}

  async findById(id: number): Promise<ArtistType | DomainException> {
    let artist: ArtistType | DomainException;
    artist = await this.artistsService.findById(id);

    if (!artist) {
      return new DomainNotFoundException('Artist not found');
    }

    artist.followers = await this.followersService.countFollowers(artist.userId);
    artist.follows = await this.followsService.countFollows(artist.userId);
    return artist;
  }

  async findOne(options: FindManyOptions<Artist>) {
    return await this.artistsService.findOne(options);
  }

  async findAll(options: FindManyOptions<Artist>): Promise<Artist[]> {
    return await this.artistsService.find(options);
  }
}
