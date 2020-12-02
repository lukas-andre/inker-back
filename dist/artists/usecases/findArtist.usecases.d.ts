import { ArtistsService } from '../domain/services/artists.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { FindManyOptions } from 'typeorm';
import { FollowersService } from '../domain/services/followers.service';
import { ArtistType } from '../domain/artistType';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
export declare class FindArtistsUseCases {
    private readonly artistsService;
    private readonly followersService;
    constructor(artistsService: ArtistsService, followersService: FollowersService);
    findById(id: string): Promise<ArtistType | DomainException>;
    findOne(options: FindManyOptions<Artist>): Promise<Artist>;
    findAll(options: FindManyOptions<Artist>): Promise<Artist[]>;
}
