import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { ArtistsService } from '../domain/services/artists.service';
import { BaseArtistResponse } from '../infrastructure/dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from '../infrastructure/dtos/updateArtist.dto';

@Injectable()
export class UpdateArtistBasicInfoUseCase extends BaseUseCase {
  constructor(private readonly aristsService: ArtistsService) {
    super(UpdateArtistBasicInfoUseCase.name);
  }

  async execute(
    id: number,
    updateArtistDto: UpdateArtistDto,
  ): Promise<BaseArtistResponse | DomainException> {
    let result = await this.aristsService.findById(id);

    if (isServiceError(result)) {
      return new DomainConflictException(this.handleServiceError(result));
    }

    if (!result) {
      return new DomainNotFoundException('Artist not found');
    }

    result = await this.aristsService.save(
      Object.assign(result, updateArtistDto),
    );

    return isServiceError(result)
      ? new DomainConflictException(this.handleServiceError(result))
      : result;
  }
}
