import { S3Client } from '../../global/clients/s3.client';
export declare class MultimediasService {
    private readonly s3Client;
    constructor(s3Client: S3Client);
    upload(file: any, source?: string, fileName?: string): Promise<AWS.S3.ManagedUpload.SendData>;
}
