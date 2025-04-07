import { Injectable } from '@nestjs/common';
import { StencilProvider } from '../../infrastructure/database/stencil.provider';
import { CreateStencilDto, StencilDto } from '../../domain/dtos/stencil.dto';
import { Artist } from '../../infrastructure/entities/artist.entity';
import { ArtistProvider } from '../../infrastructure/database/artist.provider';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ConfigService } from '@nestjs/config';
import { MultimediasService, UploadToS3Result } from '../../../multimedias/services/multimedias.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { DomainBadRequest, DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import mime from 'mime-types';
import sharp from 'sharp';
import { UniqueIdService } from '../../../global/infrastructure/services/uniqueId.service';

@Injectable()
export class CreateStencilUseCase extends BaseUseCase {
  constructor(
    private readonly stencilProvider: StencilProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly multimediasService: MultimediasService,
    private readonly configService: ConfigService,
    private readonly uniqueIdService: UniqueIdService,
  ) {
    super(CreateStencilUseCase.name);
  }

  async execute(params: { artistId: number; dto: CreateStencilDto; file: FileInterface }): Promise<StencilDto> {
    const { artistId, dto, file } = params;
    
    // Convert string values to booleans for proper handling in multipart/form-data
    const isFeatured = dto.isFeatured === 'true' || dto.isFeatured === true;
    const isHidden = dto.isHidden === 'true' || dto.isHidden === true;
    
    
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

    // Generate a unique imageId using the service
    const imageId = this.uniqueIdService.generateImageId();

    // Set version to 1 for new stencil
    const imageVersion = 1;

    // Define the source directory for files
    const source = `artist/${artistId}/stencils`;
    
    // Upload different sizes of the image
    console.time('uploadStencilFile');
    let uploadResult: UploadToS3Result[];
    try {
      uploadResult = await Promise.all([
        this.uploadOriginal(file, source, fileExtension, imageId, imageVersion),
        this.uploadThumbnail(file, source, fileExtension, imageId, imageVersion),
        this.uploadTiny(file, source, fileExtension, imageId, imageVersion),
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new DomainBadRequest('Error uploading file');
    }
    console.timeEnd('uploadStencilFile');

    // Update DTO with file URLs and imageId
    const updatedDto: CreateStencilDto = {
      ...dto,
      imageUrl: uploadResult[0].cloudFrontUrl,
      thumbnailUrl: uploadResult[1].cloudFrontUrl,
      imageId: imageId,
      imageVersion: imageVersion,
    };

    // Create the stencil using the updated DTO
    const stencil = await this.stencilProvider.createStencil(artistId, updatedDto, isFeatured, isHidden);
    
    return stencil;
  }

  async uploadOriginal(
    file: any,
    source: string,
    fileExtension: string,
    imageId: string,
    version: number,
  ) {
    const fileName = `stencil_${imageId}_v${version}.${fileExtension}`;
    return this.multimediasService.upload(file, source, fileName);
  }

  async uploadThumbnail(
    file: any,
    source: string,
    fileExtension: string,
    imageId: string,
    version: number,
  ) {
    const fileName = `stencil_thumbnail_${imageId}_v${version}.${fileExtension}`;

    const data = await sharp(file.buffer)
      .resize({ width: 512 })
      .jpeg({ quality: 70 })
      .toBuffer();
    
    // Create a new file object with the resized buffer
    const thumbnailFile = { ...file, buffer: data };
    
    return this.multimediasService.upload(thumbnailFile, source, fileName);
  }

  async uploadTiny(
    file: any,
    source: string,
    fileExtension: string,
    imageId: string,
    version: number,
  ) {
    const fileName = `stencil_tiny_${imageId}_v${version}.${fileExtension}`;

    const data = await sharp(file.buffer)
      .resize({ width: 50 })
      .jpeg({ quality: 70 })
      .toBuffer();
    
    // Create a new file object with the resized buffer
    const tinyFile = { ...file, buffer: data };
    
    return this.multimediasService.upload(tinyFile, source, fileName);
  }
}