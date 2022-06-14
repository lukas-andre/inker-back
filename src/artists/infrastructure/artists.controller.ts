import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { AuthGuard } from '../../global/infrastructure/guards/auth.guard';
import { FileUploadDto } from '../../multimedias/dtos/fileUpload.dto';
import { ArtistsHandler } from './artists.handler';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';

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
  @UseInterceptors(FileFastifyInterceptor('file'))
  async updateProfileProfilePicture(
    @UploadedFile() file,
    @Param('id', ParseIntPipe) id: number,
  ) {
    console.log('file: ', file);
    return this.artistHandler.handleUpdateProfileProfilePicture(id, file);
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
