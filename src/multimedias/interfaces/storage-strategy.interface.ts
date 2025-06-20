import { FileInterface } from './file.interface';

export interface StorageUploadResult {
  url: string;
  id: string;
  metadata?: Record<string, any>;
}

export interface StorageStrategy {
  upload(file: FileInterface, path: string, metadata?: Record<string, string>): Promise<StorageUploadResult>;
  delete(identifier: string): Promise<void>;
  getUrl(identifier: string, options?: Record<string, any>): string;
}