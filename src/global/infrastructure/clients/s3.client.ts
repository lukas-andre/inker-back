import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class S3Client {
  private client: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    if (!this.client) {
      this.client = new AWS.S3({
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
}
