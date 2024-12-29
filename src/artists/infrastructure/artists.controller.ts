import {
  Body,
  Controller,
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
import { FileUploadDto } from '../../multimedias/dtos/fileUpload.dto';
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

@ApiBearerAuth()
@ApiTags('artists')
@Controller('artist')
@UseGuards(AuthGuard)
export class ArtistsController {
  constructor(private readonly artistHandler: ArtistsHandler) {}

  @ApiOperation({ summary: 'Create Artist' })
  @ApiCreatedResponse({
    description: 'Artist has been created',
    type: BaseArtistResponse,
  })
  @ApiConflictResponse({ description: 'Artist already exists' })
  @Post()
  async create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistHandler.handleCreate(createArtistDto);
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
    return this.artistHandler.handleUpdateProfilePicture(id, file);
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
    return this.artistHandler.handleUpdateStudioPhoto(id, file);
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
    return this.artistHandler.me();
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
    return this.artistHandler.handleUpdateArtistBasicInfo(id, body);
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
    return this.artistHandler.handleUpdateMe(body);
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
}
