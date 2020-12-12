import { Injectable } from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { serviceErrorStringify } from '../../global/domain/utils/serviceErrorStringify';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { CreateArtistDto } from '../infrastructure/dtos/createArtist.dto';
import { Artist } from '../infrastructure/entities/artist.entity';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';

@Injectable()
export class CreateArtistUseCase {
  constructor(private readonly artistsService: ArtistsService) {}

  async execute(
    createArtistdto: CreateArtistDto,
  ): Promise<Artist | DomainException> {
    const created = await this.artistsService.create(createArtistdto);
    if (created instanceof ServiceError) {
      return new DomainConflictException(serviceErrorStringify(created));
    }

    return created;
  }
}
