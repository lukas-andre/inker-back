import {
  Controller,
  Post,
  Request,
  Body,
  UseInterceptors,
  UploadedFiles,
  Ip,
  HostParam,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from '../dtos/createPost.dto';
import { PostsHandler } from '../handlers/posts.handler';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';

@ApiTags('post')
@Controller('post')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);
  constructor(private readonly postHandler: PostsHandler) {}

  @ApiOperation({ summary: 'Add Post' })
  @ApiOkResponse({
    description: 'Add post ok',
    type: Boolean,
  })
  @Post()
  @UseInterceptors(FilesInterceptor('files[]', 10))
  async cretePost(
    @Ip() ip: string,
    @HostParam() host: any,
    @Request() request,
    @Body() body: CreatePostDto,
    @UploadedFiles() files: FileInterface[],
  ) {
    this.logger.log(`IP: ${ip}`);
    this.logger.log(`Host: ${JSON.stringify(host)}`);
    return this.postHandler.handleCreatePost(files, body, request);
  }

  //TODO: EDITAR POST
  //TODO: ELIMINAR POST
  //TODO: OBTENER POST DE UN ARTISTA
}
