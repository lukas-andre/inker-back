import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArtistsService } from '../domain/services/artists.service';
import { serviceErrorStringify } from '../../global/domain/utils/serviceErrorStringify';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { Artist } from './entities/artist.entity';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
import { DomainException } from 'src/global/domain/exceptions/domain.exception';
import { resolveDomainException } from 'src/global/infrastructure/exceptions/resolveDomainException';

@Injectable()
export class ArtistsHandler {
  constructor(
    private readonly createArtistUseCase: CreateArtistUseCase,
    private readonly findArtistsUseCases: FindArtistsUseCases,
    private readonly updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase,
  ) {}

  async handleCreate(createArtistdto: CreateArtistDto): Promise<Artist> {
    const created = await this.createArtistUseCase.execute(createArtistdto);
    if (created instanceof DomainException) {
      throw resolveDomainException(created);
    }

    return created;
  }

  async handleSetProfileProflePicture(id: string, file: any): Promise<Artist> {
    const result = await this.updateArtistProfilePictureUseCase.execute(
      id,
      file,
    );

    if (result instanceof DomainException) throw resolveDomainException(result);

    return result;
  }

  async handleFindById(id: string) {
    return await this.findArtistsUseCases.findById(id);
  }
  async handleGetAll(): Promise<Artist[]> {
    return await this.findArtistsUseCases.findAll({});
  }
}
