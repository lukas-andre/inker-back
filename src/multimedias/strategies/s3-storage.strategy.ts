import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { S3Client } from '../../global/infrastructure/clients/s3.client';
import { FileInterface } from '../interfaces/file.interface';
import {
  StorageStrategy,
  StorageUploadResult,
} from '../interfaces/storage-strategy.interface';

@Injectable()
export class S3StorageStrategy implements StorageStrategy {
  constructor(
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async upload(
    file: FileInterface,
    path: string,
    metadata?: Record<string, string>,
  ): Promise<StorageUploadResult> {
    const awsResult = await this.s3Client.put(file.buffer, path);
    const cloudFrontUrl = `${this.configService.get(
      'aws.cloudFrontUrl',
    )}/${path}`;

    return {
      url: cloudFrontUrl,
      id: path, // For S3, we use the path as the identifier
      metadata: {
        ...metadata,
        bucket: awsResult.Bucket,
        key: awsResult.Key,
        etag: awsResult.ETag,
      },
    };
  }

  async delete(identifier: string): Promise<void> {
    // For S3, the identifier is the path/key
    await this.s3Client.delete(identifier);
  }

  getUrl(identifier: string, _options?: Record<string, any>): string {
    // For S3, we just return the CloudFront URL
    return `${this.configService.get('aws.cloudFrontUrl')}/${identifier}`;
  }
}
