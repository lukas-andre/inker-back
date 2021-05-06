import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  Get,
  Put,
  UseGuards,
  ParseIntPipe,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ArtistsHandler } from './artists.handler';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from '../../multimedias/dtos/fileUpload.dto';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { AuthGuard } from '../../global/infrastructure/guards/auth.guard';

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

  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'profile picture', type: FileUploadDto })
  @ApiCreatedResponse({
    description: 'Artist profile picture was uploaded',
    type: BaseArtistResponse,
  })
  @ApiParam({ name: 'id', required: true, type: Number })
  @Post('/:id/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfileProflePicture(
    @UploadedFile() file,
    @Param('id', ParseIntPipe) id: number,
  ) {
    console.log('file: ', file);
    return this.artistHandler.handleUpdateProfileProflePicture(id, file);
  }

  @ApiOperation({ summary: 'Find all Artists' })
  @ApiOkResponse({
    description: 'Get all artists ok',
    isArray: true,
    type: BaseArtistResponse,
  })
  @Get()
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

  @ApiOperation({ summary: 'Update Artist Basic by Id' })
  @ApiOkResponse({
    description: 'Update artist ok',
    type: BaseArtistResponse,
  })
  @ApiParam({ name: 'id', required: true, type: Number })
  @Put(':id')
  async updateArtistBasicInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateArtistDto,
  ) {
    return this.artistHandler.handleUpdateArtistBasicInfo(id, body);
  }
}
