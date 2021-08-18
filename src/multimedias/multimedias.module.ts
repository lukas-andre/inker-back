import { Module } from '@nestjs/common';
import { MultimediasController } from './controllers/multimedias.controller';
import { MultimediasService } from './services/multimedias.service';

@Module({
  providers: [MultimediasService],
  controllers: [MultimediasController],
  exports: [MultimediasService],
})
export class MultimediasModule {}
