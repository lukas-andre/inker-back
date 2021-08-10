import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { ArtistsService } from '../domain/services/artists.service';
import { FollowersService } from '../../follows/domain/services/followers';
import { FollowingsService } from '../../follows/domain/services/followings.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { FindArtistByIdResult } from './interfaces/findArtistById.result';

@Injectable()
export class FindArtistsUseCases extends BaseUseCase {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly followersService: FollowersService,
    private readonly followingService: FollowingsService,
  ) {
    super(FindArtistsUseCases.name);
  }

  async findById(id: number): Promise<FindArtistByIdResult | DomainException> {
    const artist: Partial<FindArtistByIdResult> | ServiceError =
      await this.artistsService.findById(id);

    if (isServiceError(artist)) {
      return new DomainConflictException(this.handleServiceError(artist));
    }

    if (!artist) {
      return new DomainNotFoundException('Artist not found');
    }

    // TODO: ESTO PUEDE SER EN PARALELO
    artist.followers = await this.followersService.countFollowers(
      artist.userId,
    );
    artist.follows = await this.followingService.countFollows(artist.userId);

    return artist as FindArtistByIdResult;
  }

  async findOne(options: FindManyOptions<Artist>) {
    return this.artistsService.findOne(options);
  }

  async findAll(options: FindManyOptions<Artist>): Promise<Artist[]> {
    return this.artistsService.find(options);
  }
}
