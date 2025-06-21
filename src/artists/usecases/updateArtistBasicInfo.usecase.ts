import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { BaseArtistResponse } from '../infrastructure/dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from '../infrastructure/dtos/updateArtist.dto';
import { ArtistRepository } from '../infrastructure/repositories/artist.repository';

@Injectable()
export class UpdateArtistBasicInfoUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(private readonly artistProvider: ArtistRepository) {
    super(UpdateArtistBasicInfoUseCase.name);
  }

  async execute(
    id: string,
    updateArtistDto: UpdateArtistDto,
  ): Promise<BaseArtistResponse> {
    const artist = await this.artistProvider.findOne({
      where: { id },
      relations: ['contact'],
    });

    if (!artist) {
      throw new DomainNotFound('Artist not found');
    }

    // Update only allowed fields
    if (updateArtistDto.firstName) artist.firstName = updateArtistDto.firstName;
    if (updateArtistDto.lastName) artist.lastName = updateArtistDto.lastName;
    if (updateArtistDto.shortDescription)
      artist.shortDescription = updateArtistDto.shortDescription;

    if (updateArtistDto.contact?.email) {
      artist.contact.email = updateArtistDto.contact.email;
    }

    const updatedArtist = await this.artistProvider.save(artist);

    return updatedArtist;
  }
}
