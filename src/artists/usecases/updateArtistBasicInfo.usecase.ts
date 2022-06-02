import { Injectable } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistsService } from '../domain/services/artists.service';
import { BaseArtistResponse } from '../infrastructure/dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from '../infrastructure/dtos/updateArtist.dto';

@Injectable()
export class UpdateArtistBasicInfoUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(private readonly artistsService: ArtistsService) {
    super(UpdateArtistBasicInfoUseCase.name);
  }

  async execute(
    id: number,
    updateArtistDto: UpdateArtistDto,
  ): Promise<BaseArtistResponse | DomainException> {
    let result = await this.artistsService.findById(id);

    if (isServiceError(result)) {
      return new DomainConflictException(this.handleServiceError(result));
    }

    if (!result) {
      return new DomainNotFoundException('Artist not found');
    }

    result = await this.artistsService.save(
      Object.assign(result, updateArtistDto),
    );

    return isServiceError(result)
      ? new DomainConflictException(this.handleServiceError(result))
      : result;
  }
}
