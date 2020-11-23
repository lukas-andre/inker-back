import { ConfigService } from '@nestjs/config';
import { S3Client } from '../../global/clients/s3.client';
export declare class MultimediasService {
    private readonly s3Client;
    private readonly configService;
    constructor(s3Client: S3Client, configService: ConfigService);
    upload(file: any, source?: string, fileName?: string): Promise<{
        aws: AWS.S3.ManagedUpload.SendData;
        cloudFrontUrl: string;
    }>;
}
