import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mime from 'mime-types';
import sharp from 'sharp';

import {
  DomainBadRequest,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import {
  MultimediasService,
  UploadToS3Result,
} from '../../multimedias/services/multimedias.service';
import { ArtistDto } from '../domain/dtos/artist.dto';
import {
  ARTIST_NOT_FOUND,
  ERROR_UPLOADING_FILE,
  NOT_VALID_FILE_TO_UPLOAD,
  NOT_VALID_FILE_TYPE_TO_UPLOAD,
} from '../domain/errors/codes';
import { ArtistRepository } from '../infrastructure/repositories/artist.repository';

@Injectable()
export class UpdateArtistStudioPhotoUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly artistProvider: ArtistRepository,
    private readonly multimediasService: MultimediasService,
    private readonly configService: ConfigService,
  ) {
    super(UpdateArtistStudioPhotoUseCase.name);
  }

  async execute(id: string, file: FileInterface): Promise<ArtistDto> {
    if (!file) {
      throw new DomainBadRequest(NOT_VALID_FILE_TO_UPLOAD);
    }

    let artist = await this.artistProvider.findById(id);

    if (!artist) {
      throw new DomainNotFound(ARTIST_NOT_FOUND);
    }

    const fileExtension = mime.extension(file.mimetype);

    if (!fileExtension) {
      throw new DomainBadRequest(NOT_VALID_FILE_TYPE_TO_UPLOAD);
    }

    const version = (artist.studioPhotoVersion || 0) + 1;
    artist.studioPhotoVersion = version;

    const source = `artist/${id}`;
    console.time('uploadFile');
    let uploadResult: UploadToS3Result[];
    try {
      uploadResult = await Promise.all([
        this.uploadNormal(file, source, fileExtension, version),
        this.uploadSmall(file, source, fileExtension, version),
        this.uploadTiny(file, source, fileExtension, version),
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new DomainBadRequest(ERROR_UPLOADING_FILE);
    }
    console.timeEnd('uploadFile');

    artist.studioPhoto = uploadResult[0].cloudFrontUrl;

    artist = await this.artistProvider.save(artist);

    return artist;
  }

  async uploadNormal(
    file: any,
    source: string,
    fileExtension: string,
    version: number,
  ) {
    const fileName = `studio_photo_${version}.${fileExtension}`;
    return this.multimediasService.upload(file, source, fileName);
  }

  async uploadSmall(
    file: any,
    source: string,
    fileExtension: string,
    version: number,
  ) {
    const fileName = `studio_photo_small_${version}.${fileExtension}`;

    const data = await sharp(file.buffer)
      .resize({ width: 512 })
      .jpeg({ quality: 70 })
      .toBuffer();
    file.buffer = data;
    return this.multimediasService.upload(file, source, fileName);
  }

  async uploadTiny(
    file: any,
    source: string,
    fileExtension: string,
    version: number,
  ) {
    const fileName = `studio_photo_tiny_${version}.${fileExtension}`;

    const data = await sharp(file.buffer)
      .resize({ width: 50 })
      .jpeg({ quality: 70 })
      .toBuffer();
    file.buffer = data;
    return this.multimediasService.upload(file, source, fileName);
  }
}
