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

  public async upload(
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

  public async handlePostMultimedias(
    files: FileInterface[],
    artistId: number,
    postId: number,
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
}
