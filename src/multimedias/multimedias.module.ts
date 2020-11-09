import { Module } from '@nestjs/common';
import { MultimediasService } from './services/multimedias.service';
import { MultimediasController } from './controllers/multimedias.controller';

@Module({
  providers: [MultimediasService],
  controllers: [MultimediasController],
  exports: [MultimediasService],
})
export class MultimediasModule {}
