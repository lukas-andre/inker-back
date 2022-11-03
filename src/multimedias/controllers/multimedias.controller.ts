import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';

import { MultimediasService } from '../services/multimedias.service';

@ApiTags('multimedias')
@Controller('multimedias')
export class MultimediasController {
  constructor(private readonly multimediasService: MultimediasService) {}

  @Post('upload')
  @UseInterceptors(FileFastifyInterceptor('file'))
  async upload(@UploadedFile() file) {
    console.log('file: ', file);
    return this.multimediasService.upload(file);
  }
}
