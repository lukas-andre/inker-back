import { Injectable } from '@nestjs/common';
import { S3Client } from '../../global/clients/s3.client';

@Injectable()
export class MultimediasService {
  constructor(private readonly s3Client: S3Client) {}

  async upload(
    file: any,
    source?: string,
    fileName?: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    source = source ? source : 'inker';
    fileName = fileName ? fileName : file.originalname;
    const urlKey = `${source}/${fileName}`;
    return await this.s3Client.put(file.buffer, urlKey);
  }
}
