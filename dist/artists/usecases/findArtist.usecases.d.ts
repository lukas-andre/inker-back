import { ArtistsService } from '../domain/services/artists.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { FindManyOptions } from 'typeorm';
export declare class FindArtistsUseCases {
    private readonly artistsService;
    constructor(artistsService: ArtistsService);
    findById(id: string): Promise<Artist>;
    findOne(options: FindManyOptions<Artist>): Promise<Artist>;
    findAll(options: FindManyOptions<Artist>): Promise<Artist[]>;
}
