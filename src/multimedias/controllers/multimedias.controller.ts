import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { MultimediasService } from '../services/multimedias.service';

@ApiTags('multimedias')
@Controller('multimedias')
export class MultimediasController {
  constructor(private readonly multimediasService: MultimediasService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file) {
    console.log('file: ', file);
    return this.multimediasService.upload(file);
  }
}
