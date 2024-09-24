// src/artists/usecases/updateArtistBasicInfo.usecase.ts

import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistProvider } from '../infrastructure/database/artist.provider';
import { BaseArtistResponse } from '../infrastructure/dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from '../infrastructure/dtos/updateArtist.dto';
import { Artist } from '../infrastructure/entities/artist.entity';

import { FindArtistByIdResult } from './interfaces/findArtistById.result';

@Injectable()
export class UpdateArtistBasicInfoUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(private readonly artistProvider: ArtistProvider) {
    super(UpdateArtistBasicInfoUseCase.name);
  }

  async execute(
    id: number,
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
