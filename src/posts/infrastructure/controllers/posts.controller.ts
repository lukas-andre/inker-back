import {
  Body,
  Controller,
  Get,
  HostParam,
  Ip,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesFastifyInterceptor } from 'fastify-file-interceptor';

import { PaginationDto } from '../../../global/infrastructure/dtos/pagination.dto';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { CreatePostDto } from '../dtos/createPost.dto';
import { ListAllArtistPostsQueryDto } from '../dtos/listAllArtistPostQuery.dto';
import { ArtistPostResponseDto } from '../dtos/listAllArtistPostResponse.dto';
import { PostsHandler } from '../handlers/posts.handler';

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
  @UseInterceptors(FilesFastifyInterceptor('files[]', 10))
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
  @ApiQuery({
    name: 'genres',
    required: false,
    type: [String],
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: [String],
  })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'offset', type: Number, required: true })
  @Get('/:userId/userId')
  async listArtistPost(
    @Ip() ip: string,
    @HostParam() host: any,
    @Param('userId') userId: string,
    @Query() query: ListAllArtistPostsQueryDto,
    @Query() pagination: PaginationDto,
  ): Promise<ArtistPostResponseDto[]> {
    this.logger.log(`IP: ${ip}`);
    this.logger.log(`Host: ${JSON.stringify(host)}`);
    return this.postHandler.listArtistPostByUserId(userId, query, pagination);
  }

  //TODO: EDIT POST
  //TODO: DELETE POST
}
