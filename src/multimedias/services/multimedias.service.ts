import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { S3Client } from '../../global/infrastructure/clients/s3.client';
import { FileInterface } from '../interfaces/file.interface';
import { MultimediasMetadataInterface } from '../interfaces/multimediasMetadata.interface';

export interface UploadToS3Result {
  aws: AWS.S3.ManagedUpload.SendData;
  cloudFrontUrl: string;
}

@Injectable()
export class MultimediasService {
  constructor(
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async upload(
    file: FileInterface,
    source?: string,
    fileName?: string,
  ): Promise<UploadToS3Result> {
    source = source ? source : 'inker';
    fileName = fileName ? fileName : file.originalname;
    const urlKey = [source, fileName].join('/');
    return {
      aws: await this.s3Client.put(file.buffer, urlKey),
      cloudFrontUrl: [this.configService.get('aws.cloudFrontUrl'), urlKey].join(
        '/',
      ),
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
    const cloudFrontUrl = this.configService.get('aws.cloudFrontUrl');

    const deletePromises = workEvidence.metadata.map((fileMeta) => {
      if (fileMeta.url) {
        // Extract the S3 key from the full CloudFront URL
        const key = fileMeta.url.replace(`${cloudFrontUrl}/`, '');
        return this.s3Client.delete(key);
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
