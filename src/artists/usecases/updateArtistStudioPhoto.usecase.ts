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
import { DefaultResponse } from '../../global/infrastructure/helpers/defaultResponse.helper';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import {
  MultimediasService,
  UploadToS3Result,
} from '../../multimedias/services/multimedias.service';
import {
  ARTIST_NOT_FOUND,
  ERROR_UPLOADING_FILE,
  NOT_VALID_FILE_TO_UPLOAD,
  NOT_VALID_FILE_TYPE_TO_UPLOAD,
} from '../domain/errors/codes';
import { ArtistsDbService } from '../infrastructure/database/services/artistsDb.service';
import { UpdateStudioPhotoResponseDto } from '../infrastructure/dtos/updateStudioPhotoResponse.dto';

@Injectable()
export class UpdateArtistStudioPhotoUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly artistsDbService: ArtistsDbService,
    private readonly multimediasService: MultimediasService,
    private readonly configService: ConfigService,
  ) {
    super(UpdateArtistStudioPhotoUseCase.name);
  }

  async execute(
    id: number,
    file: FileInterface,
  ): Promise<UpdateStudioPhotoResponseDto> {
    if (!file) {
      throw new DomainBadRequest(NOT_VALID_FILE_TO_UPLOAD);
    }

    this.logger.log(`id:  ${id}`);
    console.time('existArtist');
    const artist = await this.artistsDbService.exists(id);
    console.timeEnd('existArtist');

    if (!artist) {
      throw new DomainNotFound(ARTIST_NOT_FOUND);
    }

    const fileExtension = mime.extension(file.mimetype);

    if (!fileExtension) {
      throw new DomainBadRequest(NOT_VALID_FILE_TYPE_TO_UPLOAD);
    }

    const source = `artist/${id}`;
    console.time('uploadFile');
    let uploadResult: UploadToS3Result[];
    try {
      uploadResult = await Promise.all([
        this.uploadNormal(file, source, fileExtension),
        this.uploadSmall(file, source, fileExtension),
        this.uploadTiny(file, source, fileExtension),
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new DomainBadRequest(ERROR_UPLOADING_FILE);
    }
    console.timeEnd('uploadFile');

    const cloudFrontUrl = uploadResult[0].cloudFrontUrl;

    console.time('updateStudioPhoto');
    await this.artistsDbService.updateStudioPhoto(id, cloudFrontUrl);
    console.timeEnd('updateStudioPhoto');

    return {
      ...DefaultResponse.ok,
      data: { cloudFrontUrl, id },
    } as UpdateStudioPhotoResponseDto;
  }

  async uploadNormal(file: any, source: string, fileExtension: string) {
    const fileName = `studio_photo.${fileExtension}`;
    return this.multimediasService.upload(file, source, fileName);
  }

  async uploadSmall(file: any, source: string, fileExtension: string) {
    const fileName = `studio_photo_small.${fileExtension}`;

    const data = await sharp(file.buffer)
      .resize({ width: 512 })
      .jpeg({ quality: 70 })
      .toBuffer();
    file.buffer = data;
    return this.multimediasService.upload(file, source, fileName);
  }

  async uploadTiny(file: any, source: string, fileExtension: string) {
    const fileName = `studio_photo_tiny.${fileExtension}`;

    const data = await sharp(file.buffer)
      .resize({ width: 50 })
      .jpeg({ quality: 70 })
      .toBuffer();
    file.buffer = data;
    return this.multimediasService.upload(file, source, fileName);
  }
}
