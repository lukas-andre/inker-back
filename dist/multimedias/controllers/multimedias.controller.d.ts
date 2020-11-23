import { MultimediasService } from '../services/multimedias.service';
export declare class MultimediasController {
    private readonly multimediasService;
    constructor(multimediasService: MultimediasService);
    upload(file: any): Promise<{
        aws: import("aws-sdk/clients/s3").ManagedUpload.SendData;
        cloudFrontUrl: string;
    }>;
}
