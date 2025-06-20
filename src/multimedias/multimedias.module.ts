import { Module } from '@nestjs/common';

import { GlobalModule } from '../global/global.module';
import { MultimediasController } from './controllers/multimedias.controller';
import { MultimediasService } from './services/multimedias.service';
import { S3StorageStrategy } from './strategies/s3-storage.strategy';
import { CloudflareStorageStrategy } from './strategies/cloudflare-storage.strategy';

@Module({
  imports: [GlobalModule],
  providers: [MultimediasService, S3StorageStrategy, CloudflareStorageStrategy],
  controllers: [MultimediasController],
  exports: [MultimediasService],
})
export class MultimediasModule {}
