import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ArtistsHandler } from '../artists.handler';
import { CreateWorkDto, UpdateWorkDto, WorkDto } from '../../domain/dtos/work.dto';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';

@ApiTags('Works')
@Controller('works')
export class WorksController {
  constructor(
    private readonly artistsHandler: ArtistsHandler,
    private readonly requestContext: RequestContextService,
    private readonly multimediasService: MultimediasService
  ) {}

  @Get('artist/:artistId')
  @ApiOperation({ summary: 'Get works by artist ID' })
  @ApiResponse({
    status: 200,
    description: 'Works retrieved successfully',
    type: [WorkDto],
  })
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  @ApiQuery({
    name: 'featured',
    description: 'Filter to show only featured works',
    required: false,
    type: Boolean,
  })
  async getWorksByArtistId(
    @Param('artistId') artistId: number,
    @Query('featured') featured?: boolean,
  ): Promise<WorkDto[]> {
    return this.artistsHandler.getWorks(Number(artistId), featured === true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work by ID' })
  @ApiResponse({
    status: 200,
    description: 'Work retrieved successfully',
    type: WorkDto,
  })
  @ApiParam({ name: 'id', description: 'Work ID' })
  async getWorkById(@Param('id') id: number): Promise<WorkDto> {
    return this.artistsHandler.getWorkById(Number(id));
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new work' })
  @ApiResponse({
    status: 201,
    description: 'Work created successfully',
    type: WorkDto,
  })
  async createWork(
    @Body() createWorkDto: CreateWorkDto,
  ): Promise<WorkDto> {
    const userId = this.requestContext.userId;
    const artist = await this.artistsHandler.getArtistByUserId(userId);
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistsHandler.createWork(artist, createWorkDto);
  }
  
  @Post('upload-image')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload work image' })
  async uploadWorkImage(
    @UploadedFile() file: FileInterface
  ) {
    const userId = this.requestContext.userId;
    const artist = await this.artistsHandler.getArtistByUserId(userId);
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    const source = `artist/works/${artist.id}`;
    const fileName = `work_${Date.now()}`;
    
    const { cloudFrontUrl } = await this.multimediasService.upload(file, source, fileName);
    
    return { imageUrl: cloudFrontUrl };
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a work' })
  @ApiResponse({
    status: 200,
    description: 'Work updated successfully',
    type: WorkDto,
  })
  @ApiParam({ name: 'id', description: 'Work ID' })
  async updateWork(
    @Param('id') id: number,
    @Body() updateWorkDto: UpdateWorkDto,
  ): Promise<WorkDto> {
    const userId = this.requestContext.userId;
    const artist = await this.artistsHandler.getArtistByUserId(userId);
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistsHandler.updateWork(Number(id), artist.id, updateWorkDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a work' })
  @ApiResponse({
    status: 200,
    description: 'Work deleted successfully',
  })
  @ApiParam({ name: 'id', description: 'Work ID' })
  async deleteWork(
    @Param('id') id: number,
  ): Promise<void> {
    const userId = this.requestContext.userId;
    const artist = await this.artistsHandler.getArtistByUserId(userId);
    if (!artist) {
      throw new Error('Artist profile not found for current user');
    }
    
    return this.artistsHandler.deleteWork(Number(id), artist.id);
  }
}