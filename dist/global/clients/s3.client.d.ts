/// <reference types="node" />
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
export declare class S3Client {
    private readonly configService;
    private client;
    constructor(configService: ConfigService);
    get(path: string): Promise<AWS.S3.Types.GetObjectOutput | AWS.AWSError>;
    put(data: Buffer | Uint8Array | Blob | string | Readable, path: string): Promise<AWS.S3.ManagedUpload.SendData>;
}
