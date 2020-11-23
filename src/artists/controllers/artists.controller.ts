import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ArtistsHandler } from '../handlers/artists.handler';
import { CreateArtistDto } from '../dtos/createArtist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Artist } from '../entities/artist.entity';
import { FileUploadDto } from '../../multimedias/dtos/fileUpload.dto';

@ApiTags('artists')
@Controller('artist')
export class ArtistsController {
  constructor(private readonly artistHandler: ArtistsHandler) {}

  @ApiOperation({ summary: 'Create Artist' })
  @ApiCreatedResponse({ description: 'Artist has been created', type: Artist })
  @ApiConflictResponse({ description: 'Artist already exists' })
  @Post()
  async create(@Body() createArtistDto: CreateArtistDto) {
    return await this.artistHandler.handleCreate(createArtistDto);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'profile picture', type: FileUploadDto })
  @ApiCreatedResponse({
    description: 'Artist profile picture was uploaded',
    type: Artist,
  })
  @Post('/:id/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async setProfileProflePicture(@UploadedFile() file, @Param('id') id: string) {
    return await this.artistHandler.handleSetProfileProflePicture(id, file);
  }

  @ApiOperation({ summary: 'Get all Artists' })
  @ApiOkResponse({
    description: 'Get all artists ok',
    isArray: true,
    type: Artist,
  })
  @Get()
  async getAllArtists() {
    return this.artistHandler.handleGetAll();
  }

  @ApiOperation({ summary: 'Get Artist by Id' })
  @ApiOkResponse({
    description: 'Get artist ok',
    type: Artist,
  })
  @ApiParam({ name: 'id', required: true })
  @Get(':id')
  async getArtistById(@Param('id') id: string) {
    console.log(id);
    return this.artistHandler.handleFindById(id);
  }
}
