import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '../../global/clients/s3.client';

@Injectable()
export class MultimediasService {
  constructor(
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async upload(
    file: any,
    source?: string,
    fileName?: string,
  ): Promise<{ aws: AWS.S3.ManagedUpload.SendData; cloudFrontUrl: string }> {
    source = source ? source : 'inker';
    fileName = fileName ? fileName : file.originalname;
    const urlKey = `${source}/${fileName}`;
    return {
      aws: await this.s3Client.put(file.buffer, urlKey),
      cloudFrontUrl: [this.configService.get('aws.cloudFrontUrl'), urlKey].join(
        '/',
      ),
    };
  }
}
