import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';

import { FollowedsService } from '../../follows/domain/services/followeds.service';
import { FollowingsService } from '../../follows/domain/services/followings.service';
import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { ArtistProvider } from '../infrastructure/database/artist.provider';
import { Artist } from '../infrastructure/entities/artist.entity';

import { FindArtistByIdResult } from './interfaces/findArtistById.result';

@Injectable()
export class FindArtistsUseCases extends BaseUseCase {
  constructor(
    private readonly artistsDbService: ArtistProvider,
    private readonly followedsService: FollowedsService,
    private readonly followingService: FollowingsService,
  ) {
    super(FindArtistsUseCases.name);
  }

  async findById(id: number): Promise<FindArtistByIdResult> {
    const artist: Partial<FindArtistByIdResult> =
      await this.artistsDbService.findById(id);

    if (!artist) {
      throw new DomainNotFound('Artist not found');
    }

    // TODO: ESTO PUEDE SER EN PARALELO
    artist.followers = await this.followedsService.countFollowers(
      artist.userId,
    );
    artist.follows = await this.followingService.countFollows(artist.userId);

    return artist as FindArtistByIdResult;
  }

  async findOne(options: FindManyOptions<Artist>) {
    return this.artistsDbService.findOne(options);
  }

  async findAll(options: FindManyOptions<Artist>): Promise<Artist[]> {
    return this.artistsDbService.find(options);
  }
}
