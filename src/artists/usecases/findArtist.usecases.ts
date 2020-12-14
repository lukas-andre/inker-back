import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { ArtistsService } from '../domain/services/artists.service';
import { ArtistType } from '../domain/artistType';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { FollowedsService } from '../../follows/domain/services/followeds.service';
import { FollowingsService } from '../../follows/domain/services/followings.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { FindArtistByIdResult } from './interfaces/findArtistById.result';

@Injectable()
export class FindArtistsUseCases {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly followedsService: FollowedsService,
    private readonly followingService: FollowingsService,
  ) {}

  async findById(id: number): Promise<FindArtistByIdResult | DomainException> {
    let artist: ArtistType | DomainException;
    artist = await this.artistsService.findById(id);

    if (!artist) {
      return new DomainNotFoundException('Artist not found');
    }

    artist.followers = await this.followedsService.countFollowers(artist.userId);
    artist.follows = await this.followingService.countFollows(artist.userId);
    return artist;
  }

  async findOne(options: FindManyOptions<Artist>) {
    return await this.artistsService.findOne(options);
  }

  async findAll(options: FindManyOptions<Artist>): Promise<Artist[]> {
    return await this.artistsService.find(options);
  }
}
