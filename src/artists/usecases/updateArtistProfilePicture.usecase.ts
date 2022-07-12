import { Injectable } from '@nestjs/common';
import stringify from 'fast-safe-stringify';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { ArtistsDbService } from '../infrastructure/database/services/artistsDb.service';
import { Artist } from '../infrastructure/entities/artist.entity';
@Injectable()
export class UpdateArtistProfilePictureUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly artistsDbService: ArtistsDbService,
    private readonly multimediasService: MultimediasService,
  ) {
    super(UpdateArtistProfilePictureUseCase.name);
  }

  async execute(id: number, file: any): Promise<Artist | DomainException> {
    if (!file) return new DomainNotFoundException('Not valid file to upload');

    this.logger.log(`id:  ${id}`);
    this.logger.log(`file:  ${stringify(file)}`);

    let artist = await this.artistsDbService.findById(id);

    if (isServiceError(artist)) {
      return new DomainConflictException(this.handleServiceError(artist));
    }

    if (!artist) return new DomainNotFoundException('Artists not found');

    const source = `artist/${id}`;
    const fileName = `profile_picture_${id}`;
    console.time('uploadFile');

    // TODO: HANDLE ERROR HERE
    const { aws, cloudFrontUrl } = await this.multimediasService.upload(
      file,
      source,
      fileName,
    );
    console.timeEnd('uploadFile');

    artist.profileThumbnail = cloudFrontUrl;

    artist = await this.artistsDbService.save(artist);

    this.logger.log(`artist: ' ${stringify(artist)}`);

    return isServiceError(artist)
      ? new DomainConflictException(artist)
      : artist;
  }
}
