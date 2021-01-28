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
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from '../dtos/createPost.dto';
import { PostsHandler } from '../handlers/posts.handler';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { ListAllArtistPostsQueryDto } from '../dtos/listAllArtistPostQuery.dto';
import { PaginationDto } from '../../../global/infrastructure/dtos/pagination.dto';
import { ArtistPostResponseDto } from '../dtos/listAllArtistPostResponse.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);
  constructor(private readonly postHandler: PostsHandler) {}

  @ApiOperation({ summary: 'Add Post' })
  @ApiOkResponse({
    description: 'Add post ok',
    type: ArtistPostResponseDto,
  })
  @Post()
  @UseInterceptors(FilesInterceptor('files[]', 10))
  async cretePost(
    @Ip() ip: string,
    @HostParam() host: any,
    @Request() request,
    @Body() body: CreatePostDto,
    @UploadedFiles() files: FileInterface[],
  ): Promise<ArtistPostResponseDto> {
    this.logger.log(`IP: ${ip}`);
    this.logger.log(`Host: ${JSON.stringify(host)}`);
    return this.postHandler.handleCreatePost(files, body, request);
  }

  @ApiOperation({ summary: 'Get Artist Post by user id' })
  @ApiOkResponse({
    description: 'Get artist post ok',
    type: ArtistPostResponseDto,
    isArray: true,
  })
  @ApiParam({ name: 'userId', example: 1, required: true })
  @Get('/:userId/userId')
  async listArtistPost(
    @Ip() ip: string,
    @HostParam() host: any,
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: ListAllArtistPostsQueryDto,
    @Query() pagination: PaginationDto,
  ): Promise<ArtistPostResponseDto[]> {
    this.logger.log(`IP: ${ip}`);
    this.logger.log(`Host: ${JSON.stringify(host)}`);
    return this.postHandler.listArtistPostByUserId(userId, query, pagination);
  }

  //TODO: EDITAR POST
  //TODO: ELIMINAR POST
}
