import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CloudflareImagesClient } from '../../global/infrastructure/clients/cloudflare-images.client';
import { S3Client } from '../../global/infrastructure/clients/s3.client';
import { FileInterface } from '../interfaces/file.interface';
import { MultimediasMetadataInterface } from '../interfaces/multimediasMetadata.interface';
import { StorageStrategy } from '../interfaces/storage-strategy.interface';
import { CloudflareStorageStrategy } from '../strategies/cloudflare-storage.strategy';
import { S3StorageStrategy } from '../strategies/s3-storage.strategy';

export interface UploadToS3Result {
  aws: AWS.S3.ManagedUpload.SendData;
  cloudFrontUrl: string;
}

@Injectable()
export class MultimediasService {
  private readonly logger = new Logger(MultimediasService.name);
  private storageStrategy: StorageStrategy;

  constructor(
    private readonly s3Client: S3Client,
    private readonly cloudflareClient: CloudflareImagesClient,
    private readonly configService: ConfigService,
  ) {
    // Initialize storage strategy based on configuration
    const storageProvider = this.configService.get<string>(
      'app.storageProvider',
    );
    this.logger.log(`Initializing storage strategy: ${storageProvider}`);

    if (storageProvider === 'cloudflare') {
      this.storageStrategy = new CloudflareStorageStrategy(
        this.cloudflareClient,
      );
    } else {
      this.storageStrategy = new S3StorageStrategy(
        this.s3Client,
        this.configService,
      );
    }
  }

  async upload(
    file: FileInterface,
    source?: string,
    fileName?: string,
  ): Promise<UploadToS3Result> {
    source = source ? source : 'inker';
    fileName = fileName ? fileName : file.originalname;
    const urlKey = [source, fileName].join('/');

    const result = await this.storageStrategy.upload(file, urlKey);

    // Return in legacy format for backward compatibility
    return {
      aws: {
        Location: result.url,
        Bucket: result.metadata?.bucket || '',
        Key: result.id,
        ETag: result.metadata?.etag || '',
      } as any,
      cloudFrontUrl: result.url,
    };
  }

  async handlePostMultimedias(
    files: FileInterface[],
    artistId: string,
    postId: string,
  ): Promise<MultimediasMetadataInterface> {
    const multimediasMetadata: MultimediasMetadataInterface = {
      count: 0,
      metadata: [],
    };
    for (const [index, file] of files.entries()) {
      console.log('uploading file: ', file);

      const source = `artist/posts/${artistId}`;
      const fileName = `${postId}_${index}`;

      console.time('uploadFile');
      // TODO: this upload can be in parallel !!!
      const { cloudFrontUrl } = await this.upload(file, source, fileName);
      console.timeEnd('uploadFile');

      multimediasMetadata.metadata.push({
        url: cloudFrontUrl,
        type: file.mimetype,
        encoding: file.encoding,
        fieldname: file.fieldname,
        originalname: file.originalname,
        size: file.size,
        position: index,
      });
      multimediasMetadata.count++;
    }
    return multimediasMetadata;
  }

  async handleWorkEvidenceMultimedias(
    files: FileInterface[],
    eventId: string,
    agendaId: string,
  ): Promise<MultimediasMetadataInterface> {
    const multimediasMetadata: MultimediasMetadataInterface = {
      count: 0,
      metadata: [],
    };
    for (const [index, file] of files.entries()) {
      console.log('uploading file: ', file);

      const source = `agenda/${agendaId}/event/${eventId}/work-evidence`;
      const fileName = `file_${index}`;

      console.time('uploadFile');
      const { cloudFrontUrl } = await this.upload(file, source, fileName);
      console.timeEnd('uploadFile');

      multimediasMetadata.metadata.push({
        url: cloudFrontUrl,
        type: file.mimetype,
        encoding: file.encoding,
        fieldname: file.fieldname,
        originalname: file.originalname,
        size: file.size,
        position: index,
      });
      multimediasMetadata.count++;
    }
    return multimediasMetadata;
  }

  async deleteWorkEvidence(
    workEvidence: MultimediasMetadataInterface,
  ): Promise<void> {
    if (!workEvidence || !workEvidence.metadata) {
      return;
    }

    const storageProvider = this.configService.get<string>(
      'app.storageProvider',
    );
    const deletePromises = workEvidence.metadata.map(fileMeta => {
      if (fileMeta.url) {
        if (storageProvider === 'cloudflare') {
          // For Cloudflare, we need to extract the image ID from the URL
          // URL format: https://imagedelivery.net/{account_hash}/{image_id}/{variant}
          const urlParts = fileMeta.url.split('/');
          const imageId = urlParts[urlParts.length - 2]; // Get image ID
          return this.storageStrategy.delete(imageId);
        } else {
          // For S3, extract the key from the CloudFront URL
          const cloudFrontUrl = this.configService.get('aws.cloudFrontUrl');
          const key = fileMeta.url.replace(`${cloudFrontUrl}/`, '');
          return this.storageStrategy.delete(key);
        }
      }
      return Promise.resolve();
    });

    await Promise.all(deletePromises);
  }

  async uploadReferenceImages(
    files: FileInterface[],
    quotationId: string,
    artistId: string,
  ): Promise<MultimediasMetadataInterface> {
    const multimediasMetadata: MultimediasMetadataInterface = {
      count: 0,
      metadata: [],
    };
    for (const [index, file] of files.entries()) {
      console.log('uploading file: ', file);

      const source = `quotation/${quotationId}/artist/${artistId}/reference-images`;
      const fileName = `reference_${index}`;

      console.time('uploadFile');
      const { cloudFrontUrl } = await this.upload(file, source, fileName);
      console.timeEnd('uploadFile');

      multimediasMetadata.metadata.push({
        url: cloudFrontUrl,
        type: file.mimetype,
        encoding: file.encoding,
        fieldname: file.fieldname,
        originalname: file.originalname,
        size: file.size,
        position: index,
      });
      multimediasMetadata.count++;
    }
    return multimediasMetadata;
  }

  async uploadProposedImages(
    files: FileInterface[],
    quotationId: string,
    artistId: string,
  ): Promise<MultimediasMetadataInterface> {
    const multimediasMetadata: MultimediasMetadataInterface = {
      count: 0,
      metadata: [],
    };
    for (const [index, file] of files.entries()) {
      console.log('uploading file: ', file);

      const source = `quotation/${quotationId}/artist/${artistId}/proposed-images`;
      const fileName = `proposed_${index}`;

      console.time('uploadFile');
      const { cloudFrontUrl } = await this.upload(file, source, fileName);
      console.timeEnd('uploadFile');

      multimediasMetadata.metadata.push({
        url: cloudFrontUrl,
        type: file.mimetype,
        encoding: file.encoding,
        fieldname: file.fieldname,
        originalname: file.originalname,
        size: file.size,
        position: index,
      });
      multimediasMetadata.count++;
    }
    return multimediasMetadata;
  }

  async uploadProposedDesigns(
    files: FileInterface[],
    quotationId: string,
    artistId: string,
  ): Promise<MultimediasMetadataInterface> {
    const multimediasMetadata: MultimediasMetadataInterface = {
      count: 0,
      metadata: [],
    };
    for (const [index, file] of files.entries()) {
      console.log('uploading file: ', file);

      const source = `quotation/${quotationId}/artist/${artistId}/proposed-designs`;
      const fileName = `design_${index}`;

      console.time('uploadFile');
      const { cloudFrontUrl } = await this.upload(file, source, fileName);
      console.timeEnd('uploadFile');

      multimediasMetadata.metadata.push({
        url: cloudFrontUrl,
        type: file.mimetype,
        encoding: file.encoding,
        fieldname: file.fieldname,
        originalname: file.originalname,
        size: file.size,
        position: index,
      });
      multimediasMetadata.count++;
    }
    return multimediasMetadata;
  }
}
