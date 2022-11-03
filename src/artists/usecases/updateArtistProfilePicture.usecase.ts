import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import stringify from 'fast-safe-stringify';
import * as sharp from 'sharp';
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
    private readonly configService: ConfigService,
  ) {
    super(UpdateArtistProfilePictureUseCase.name);
  }

  async execute(id: number, file: FileInterface): Promise<Artist> {
    if (!file) {
      throw new DomainBadRequest('Not valid file to upload');
    }

    this.logger.log(`id:  ${id}`);
    let artist = await this.artistsDbService.findById(id);

    if (!artist) {
      throw new DomainNotFound('Artists not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mime = require('mime-types');
    const fileExtension = mime.extension(file.mimetype);

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
      throw new DomainBadRequest(error.message);
    }

    artist.profileThumbnail = uploadResult[0].cloudFrontUrl;

    artist = await this.artistsDbService.save(artist);

    this.logger.log(`artist: ' ${stringify(artist)}`);

    return artist;
  }

  async uploadNormal(file: any, source: string, fileExtension: string) {
    const fileName = `profile_picture.${fileExtension}`;
    return this.multimediasService.upload(file, source, fileName);
  }

  async uploadSmall(file: any, source: string, fileExtension: string) {
    const fileName = `profile_picture_small.${fileExtension}`;

    const data = await sharp(file.buffer)
      .resize({ width: 512 })
      .jpeg({ quality: 70 })
      .toBuffer();
    file.buffer = data;
    return this.multimediasService.upload(file, source, fileName);
  }

  async uploadTiny(file: any, source: string, fileExtension: string) {
    const fileName = `profile_picture_tiny.${fileExtension}`;

    const data = await sharp(file.buffer)
      .resize({ width: 50 })
      .jpeg({ quality: 70 })
      .toBuffer();
    file.buffer = data;
    return this.multimediasService.upload(file, source, fileName);
  }
}
