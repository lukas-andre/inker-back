import { Injectable } from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { FindManyOptions } from 'typeorm';
import { FollowersService } from '../domain/services/followers.service';
import { ArtistType } from '../domain/artistType';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';

@Injectable()
export class FindArtistsUseCases {
  constructor(private readonly artistsService: ArtistsService, private readonly followersService: FollowersService) {}

  async findById(id: number): Promise<ArtistType | DomainException> {
    let result: ArtistType | DomainException
    result = await this.artistsService.findById(id);
  
    if(!result) {
      return new DomainNotFoundException('Artist not found');
    }
    
    result.followers = await this.followersService.countFollowers(result.id);
    return result;
  }

  async findOne(options: FindManyOptions<Artist>) {
    return await this.artistsService.findOne(options);
  }

  async findAll(options: FindManyOptions<Artist>): Promise<Artist[]> {
    return await this.artistsService.find(options);
  }
}
