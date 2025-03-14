import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';

import { AuthGuard } from '../../global/infrastructure/guards/auth.guard';
import { errorCodesToOASDescription } from '../../global/infrastructure/helpers/errorCodesToOASDescription.helper';
import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import { FileUploadDto } from '../../multimedias/dtos/fileUpload.dto';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { ArtistDto } from '../domain/dtos/artist.dto';
import {
  ARTIST_NOT_FOUND,
  ERROR_UPLOADING_FILE,
  NOT_VALID_FILE_TO_UPLOAD,
  PROBLEMS_UPDATING_STUDIO_PHOTO,
} from '../domain/errors/codes';

import { ArtistsHandler } from './artists.handler';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { SearchArtistDto } from './dtos/searchArtist.dto';
import { PaginatedStencilResponseDto } from '../domain/dtos/paginated-stencil-response.dto';
import { StencilQueryDto } from '../domain/dtos/stencil-query.dto';

@ApiBearerAuth()
@ApiTags('artists')
@Controller('artist')
@UseGuards(AuthGuard)
export class ArtistsController {
  constructor(
    private readonly artistHandler: ArtistsHandler,
    private readonly requestContext: RequestContextService,
    private readonly multimediasService: MultimediasService
  ) {}

  @ApiOperation({ summary: 'Create Artist' })
  @ApiCreatedResponse({
    description: 'Artist has been created',
    type: BaseArtistResponse,
  })
  @ApiConflictResponse({ description: 'Artist already exists' })
  @Post()
  async create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistHandler.createArtist(createArtistDto);
  }

  @ApiOperation({ summary: 'Upload artist profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Profile picture', type: FileUploadDto })
  @ApiCreatedResponse({
    description: 'Artist profile picture was uploaded',
    type: BaseArtistResponse,
  })
  @ApiParam({ name: 'id', required: true, type: Number, example: 1 })
  @Post('/:id/profile-picture')
  @UseInterceptors(FileFastifyInterceptor('file'))
  async updateProfilePicture(
    @UploadedFile() file,
    @Param('id', ParseIntPipe) id: number,
  ) {
    console.log('file: ', file);
    return this.artistHandler.updateProfilePicture(id, file);
  }

  @ApiOperation({ summary: 'Upload artist studio photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Studio photo', type: FileUploadDto })
  @ApiCreatedResponse({
    description: 'Artist studio photo was uploaded',
    type: ArtistDto,
  })
  @ApiBadRequestResponse({
    description: errorCodesToOASDescription([
      NOT_VALID_FILE_TO_UPLOAD,
      ERROR_UPLOADING_FILE,
      'Not valid file type to upload',
    ]),
  })
  @ApiNotFoundResponse({ description: ARTIST_NOT_FOUND })
  @ApiInternalServerErrorResponse({
    description: PROBLEMS_UPDATING_STUDIO_PHOTO,
  })
  @ApiParam({ name: 'id', required: true, type: Number, example: 1 })
  @Post('/:id/studio-photo')
  @UseInterceptors(FileFastifyInterceptor('file'))
  async updateStudioPhoto(
    @UploadedFile() file,
    @Param('id', ParseIntPipe) id: number,
  ) {
    console.log('file: ', file);
    return this.artistHandler.updateStudioPhoto(id, file);
  }

  @ApiOperation({ summary: 'Find all Artists' })
  @ApiOkResponse({
    description: 'Get all artists ok',
    isArray: true,
    type: BaseArtistResponse,
  })
  @Get()
  // TODO: add query DTO with artist entity fields
  async findAllArtists() {
    return this.artistHandler.handleGetAll();
  }

  @ApiOperation({ summary: 'Find Artist by Id' })
  @ApiOkResponse({
    description: 'Find artist ok',
    type: BaseArtistResponse,
  })
  @ApiParam({ name: 'id', required: true, type: Number })
  @Get(':id')
  async findArtistById(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.artistHandler.handleFindById(id);
  }

  @ApiOperation({ summary: 'Find Artist by auth token for profile page' })
  @ApiOkResponse({
    description: 'Find artist ok',
    type: BaseArtistResponse,
  })
  @Get('me')
  async me() {
    const userId = this.requestContext.userId;
    return this.artistHandler.getArtistByUserId(userId);
  }

  @ApiOperation({ summary: 'Update Artist Basic by Id' })
  @ApiOkResponse({
    description: 'Update artist ok',
    type: BaseArtistResponse,
  })
  @ApiParam({ name: 'id', required: true, type: Number })
  @Put(':id')
  @UsePipes(new ValidationPipe({ forbidUnknownValues: false }))
  async updateArtistBasicInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateArtistDto,
  ) {
    return this.artistHandler.updateArtistBasicInfo(id, body);
  }

  @ApiOperation({ summary: 'Update Artist Basic by Id' })
  @ApiOkResponse({
    description: 'Update artist ok',
    type: BaseArtistResponse,
  })
  @ApiParam({ name: 'id', required: true, type: Number })
  @Put('/me')
  @UsePipes(new ValidationPipe({ forbidUnknownValues: false }))
  async updateMe(@Body() body: UpdateArtistDto) {
    const userId = this.requestContext.userId;
    return this.artistHandler.updateArtistBasicInfo(userId, body);
  }

  @ApiOperation({ summary: 'Search Artists' })
  @ApiOkResponse({
    description: 'Search artists results',
    type: BaseArtistResponse,
    isArray: true,
  })
  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchArtists(@Query() searchParams: SearchArtistDto) {
    return this.artistHandler.handleSearchArtists(searchParams);
  }
  
  @ApiOperation({ summary: 'Get artist works' })
  @ApiOkResponse({
    description: 'Artist works retrieved successfully',
    isArray: true
  })
  @ApiParam({ name: 'id', required: true, type: Number })
  @Get(':id/works')
  async getArtistWorks(
    @Param('id', ParseIntPipe) id: number,
    @Query('featured') featured?: boolean,
  ) {
    return this.artistHandler.getWorks(id, featured === true);
  }
  
  @ApiOperation({ summary: 'Get artist stencils' })
  @ApiOkResponse({
    description: 'Artist stencils retrieved successfully',
    type: PaginatedStencilResponseDto
  })
  @ApiParam({ name: 'id', required: true, type: Number })
  @Get(':id/stencils')
  async getArtistStencils(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: StencilQueryDto,
  ) {
    return this.artistHandler.getStencils(id, query);
  }
  
  @ApiOperation({ summary: 'Upload work image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Work image', type: FileUploadDto })
  @ApiCreatedResponse({
    description: 'Work image uploaded successfully'
  })
  @Post('/me/upload-work-image')
  @UseInterceptors(FileFastifyInterceptor('file'))
  async uploadWorkImage(@UploadedFile() file) {
    const userId = this.requestContext.userId;
    const artist = await this.artistHandler.getArtistByUserId(userId);
    
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    const source = `artist/works/${artist.id}`;
    const fileName = `work_${Date.now()}`;
    
    const { cloudFrontUrl } = await this.multimediasService.upload(file, source, fileName);
    
    return { imageUrl: cloudFrontUrl };
  }
  
  @ApiOperation({ summary: 'Upload stencil image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Stencil image', type: FileUploadDto })
  @ApiCreatedResponse({
    description: 'Stencil image uploaded successfully'
  })
  @Post('/me/upload-stencil-image')
  @UseInterceptors(FileFastifyInterceptor('file'))
  async uploadStencilImage(@UploadedFile() file) {
    const userId = this.requestContext.userId;
    const artist = await this.artistHandler.getArtistByUserId(userId);
    
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    const source = `artist/stencils/${artist.id}`;
    const fileName = `stencil_${Date.now()}`;
    
    const { cloudFrontUrl } = await this.multimediasService.upload(file, source, fileName);
    
    return { imageUrl: cloudFrontUrl };
  }
  
  @ApiOperation({ summary: 'Get current artist styles' })
  @ApiOkResponse({
    description: 'Artist styles retrieved successfully',
    isArray: true
  })
  @Get('/me/styles')
  async getCurrentArtistStyles() {
    const userId = this.requestContext.userId;
    const artist = await this.artistHandler.getArtistByUserId(userId);
    
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistHandler.getArtistStyles(artist.id);
  }
  
  @ApiOperation({ summary: 'Add style to current artist profile' })
  @ApiCreatedResponse({
    description: 'Style added successfully'
  })
  @Post('/me/styles')
  async addCurrentArtistStyle(@Body() createArtistStyleDto: any) {
    const userId = this.requestContext.userId;
    const artist = await this.artistHandler.getArtistByUserId(userId);
    
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistHandler.addArtistStyle(artist.id, createArtistStyleDto);
  }
  
  @ApiOperation({ summary: 'Update current artist style' })
  @ApiOkResponse({
    description: 'Style updated successfully'
  })
  @ApiParam({ name: 'styleName', required: true, type: String })
  @Put('/me/styles/:styleName')
  async updateCurrentArtistStyle(
    @Param('styleName') styleName: string,
    @Body() updateArtistStyleDto: any
  ) {
    const userId = this.requestContext.userId;
    const artist = await this.artistHandler.getArtistByUserId(userId);
    
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistHandler.updateArtistStyle(artist.id, styleName, updateArtistStyleDto);
  }
  
  @ApiOperation({ summary: 'Remove style from current artist profile' })
  @ApiOkResponse({
    description: 'Style removed successfully'
  })
  @ApiParam({ name: 'styleName', required: true, type: String })
  @Delete('/me/styles/:styleName')
  async removeCurrentArtistStyle(@Param('styleName') styleName: string) {
    const userId = this.requestContext.userId;
    const artist = await this.artistHandler.getArtistByUserId(userId);
    
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistHandler.removeArtistStyle(artist.id, styleName);
  }
}
