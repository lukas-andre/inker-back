import { Readable } from 'stream';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Client {
  private client: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    if (!this.client) {
      this.client = new S3({
        accessKeyId: this.configService.get('aws.accessKey'),
        secretAccessKey: this.configService.get('aws.secretKey'),
        region: this.configService.get('aws.region'),
      });
    }
  }

  async get(
    path: string,
  ): Promise<AWS.S3.Types.GetObjectOutput | AWS.AWSError> {
    const params: AWS.S3.Types.GetObjectRequest = {
      Bucket: this.configService.get('aws.bucketName'),
      Key: path,
    };

    return this.client.getObject(params).promise();
  }

  async put(
    data: Buffer | Uint8Array | Blob | string | Readable,
    path: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const params: AWS.S3.Types.PutObjectRequest = {
      Bucket: this.configService.get('aws.artistBucketName'),
      Body: data,
      Key: path,
    };
    return this.client.upload(params).promise();
  }

  async delete(path: string): Promise<AWS.S3.DeleteObjectOutput> {
    const params: AWS.S3.Types.DeleteObjectRequest = {
      Bucket: this.configService.get('aws.artistBucketName'),
      Key: path,
    };
    return this.client.deleteObject(params).promise();
  }
}
