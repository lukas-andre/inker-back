import { Injectable } from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { FindManyOptions } from 'typeorm';
import { FollowersService } from '../domain/services/followers.service';
import { findArtistById } from './interfaces/findArtistById.result';
import { ArtistType } from '../domain/artistType';

@Injectable()
export class FindArtistsUseCases {
  constructor(private readonly artistsService: ArtistsService, private readonly followersService: FollowersService) {}

  async findById(id: string): Promise<ArtistType> {
    const artist: findArtistById = await this.artistsService.findById(id);
    artist.followers = await this.followersService.countFollowers(artist.id);
    return artist;
  }

  async findOne(options: FindManyOptions<Artist>) {
    return await this.artistsService.findOne(options);
  }

  async findAll(options: FindManyOptions<Artist>): Promise<Artist[]> {
    return await this.artistsService.find(options);
  }
}
