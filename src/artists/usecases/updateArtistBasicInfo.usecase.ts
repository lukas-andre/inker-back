import { Injectable } from '@nestjs/common';
import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistsDbService } from '../infrastructure/database/services/artistsDb.service';
import { BaseArtistResponse } from '../infrastructure/dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from '../infrastructure/dtos/updateArtist.dto';

@Injectable()
export class UpdateArtistBasicInfoUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(private readonly artistsDbService: ArtistsDbService) {
    super(UpdateArtistBasicInfoUseCase.name);
  }

  async execute(
    id: number,
    updateArtistDto: UpdateArtistDto,
  ): Promise<BaseArtistResponse> {
    let result = await this.artistsDbService.findById(id);

    if (!result) {
      throw new DomainNotFound('Artist not found');
    }

    result = await this.artistsDbService.save(
      Object.assign(result, updateArtistDto),
    );

    return result;
  }
}
