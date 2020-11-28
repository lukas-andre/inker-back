import {
  Injectable,
} from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class FindArtistsUseCases {
  constructor(
    private readonly artistsService: ArtistsService,
  ) {}

  async findById(id: string) {
    return await this.artistsService.findById(id);
  }

  async findOne(options: FindManyOptions<Artist>) {
    return await this.artistsService.findOne(options);
  }

  async findAll(options: FindManyOptions<Artist>): Promise<Artist[]> {
    return await this.artistsService.find(options);
  }
}
