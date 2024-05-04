import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';

import { FollowedsProvider } from '../../follows/infrastructure/database/followeds.provider';
import { FollowingsProvider } from '../../follows/infrastructure/database/followings.provider';
import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { ArtistProvider } from '../infrastructure/database/artist.provider';
import { Artist } from '../infrastructure/entities/artist.entity';

import { FindArtistByIdResult } from './interfaces/findArtistById.result';

@Injectable()
export class FindArtistsUseCases extends BaseUseCase {
  constructor(
    private readonly artistProvider: ArtistProvider,
    private readonly followedsProvider: FollowedsProvider,
    private readonly followingProvider: FollowingsProvider,
  ) {
    super(FindArtistsUseCases.name);
  }

  async findById(id: number): Promise<FindArtistByIdResult> {
    const artist: Partial<FindArtistByIdResult> =
      await this.artistProvider.findById(id);

    if (!artist) {
      throw new DomainNotFound('Artist not found');
    }

    // TODO: ESTO PUEDE SER EN PARALELO
    artist.followers = await this.followedsProvider.countFollowers(
      artist.userId,
    );
    artist.follows = await this.followingProvider.countFollows(artist.userId);

    return artist as FindArtistByIdResult;
  }

  async findOne(options: FindManyOptions<Artist>) {
    return this.artistProvider.findOne(options);
  }

  async findAll(options: FindManyOptions<Artist>): Promise<Artist[]> {
    return this.artistProvider.find(options);
  }
}
