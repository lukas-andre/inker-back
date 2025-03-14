import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { CreateWorkDto, WorkDto } from '../../domain/dtos/work.dto';
import { ArtistProvider } from '../../infrastructure/database/artist.provider';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ConfigService } from '@nestjs/config';
import { MultimediasService, UploadToS3Result } from '../../../multimedias/services/multimedias.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { DomainBadRequest, DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import mime from 'mime-types';
import sharp from 'sharp';

@Injectable()
export class CreateWorkUseCase extends BaseUseCase {
  constructor(
    private readonly workProvider: WorkProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly multimediasService: MultimediasService,
    private readonly configService: ConfigService,
  ) {
    super(CreateWorkUseCase.name);
  }

  async execute(params: { artistId: number; dto: CreateWorkDto; file: FileInterface }): Promise<WorkDto> {
    const { artistId, dto, file } = params;
    
    // Validate artist
    const existingArtist = await this.artistProvider.findById(artistId);
    if (!existingArtist) {
      throw new DomainNotFound('Artist not found');
    }

    // Validate file
    if (!file) {
      throw new DomainBadRequest('No valid file to upload');
    }

    // Get file extension
    const fileExtension = mime.extension(file.mimetype);
    if (!fileExtension) {
      throw new DomainBadRequest('Not valid file type to upload');
    }

    // Set version to 1 for new work
    const imageVersion = 1;

    // Define the source directory for files
    const source = `artist/${artistId}/works`;
    
    // Upload different sizes of the image
    console.time('uploadWorkFile');
    let uploadResult: UploadToS3Result[];
    try {
      uploadResult = await Promise.all([
        this.uploadOriginal(file, source, fileExtension, imageVersion),
        this.uploadThumbnail(file, source, fileExtension, imageVersion),
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new DomainBadRequest('Error uploading file');
    }
    console.timeEnd('uploadWorkFile');

    // Update DTO with file URLs
    const updatedDto: CreateWorkDto = {
      ...dto,
      imageUrl: uploadResult[0].cloudFrontUrl,
      thumbnailUrl: uploadResult[1].cloudFrontUrl,
      imageVersion: imageVersion,
      thumbnailVersion: imageVersion,
    };

    // Create the work using the updated DTO
    const work = await this.workProvider.createWork(artistId, updatedDto);
    
    return work;
  }

  async uploadOriginal(
    file: any,
    source: string,
    fileExtension: string,
    version: number,
  ) {
    const fileName = `work_${version}.${fileExtension}`;
    return this.multimediasService.upload(file, source, fileName);
  }

  async uploadThumbnail(
    file: any,
    source: string,
    fileExtension: string,
    version: number,
  ) {
    const fileName = `work_thumbnail_${version}.${fileExtension}`;

    const data = await sharp(file.buffer)
      .resize({ width: 512 })
      .jpeg({ quality: 70 })
      .toBuffer();
    
    // Create a new file object with the resized buffer
    const thumbnailFile = { ...file, buffer: data };
    
    return this.multimediasService.upload(thumbnailFile, source, fileName);
  }
}