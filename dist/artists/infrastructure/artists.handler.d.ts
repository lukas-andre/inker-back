import { CreateArtistDto } from './dtos/createArtist.dto';
import { Artist } from './entities/artist.entity';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
export declare class ArtistsHandler {
    private readonly createArtistUseCase;
    private readonly findArtistsUseCases;
    private readonly updateArtistProfilePictureUseCase;
    constructor(createArtistUseCase: CreateArtistUseCase, findArtistsUseCases: FindArtistsUseCases, updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase);
    handleCreate(createArtistdto: CreateArtistDto): Promise<Artist>;
    handleSetProfileProflePicture(id: string, file: any): Promise<Artist>;
    handleFindById(id: string): Promise<Artist>;
    handleGetAll(): Promise<Artist[]>;
}
