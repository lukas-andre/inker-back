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
  UsePipes,
  ValidationPipe,
  Headers,
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
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { WorkQueryDto } from '../../domain/dtos/work-query.dto';
import { PaginatedWorkResponseDto } from '../../domain/dtos/paginated-work-response.dto';
import { WorkSource } from '../../domain/workType';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { PaginatedWorkResponseWithMetrics } from '../../usecases/work/get-works-paginated.usecase';

@ApiTags('Works')
@UseGuards(AuthGuard)
@Controller('works')
export class WorksController {
  constructor(
    private readonly artistsHandler: ArtistsHandler,
    private readonly multimediasService: MultimediasService
  ) {}


  @Get('artist/:artistId')
  @ApiOperation({ summary: 'Get paginated works by artist ID' })
  @ApiResponse({
    status: 200,
    description: 'Paginated works retrieved successfully',
    type: PaginatedWorkResponseDto,
  })
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  @ApiQuery({ name: 'isFeatured', required: false, description: 'Filter by featured status' })
  @ApiQuery({ 
    name: 'source', 
    required: false, 
    description: 'Filter by work source (APP or EXTERNAL)', 
    enum: WorkSource 
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getWorksByArtistIdPaginated(
    @Param('artistId') artistId: number,
    @Query() query: WorkQueryDto,
    @Headers('cache-control') cacheControl?: string
  ): Promise<PaginatedWorkResponseWithMetrics> {
    const disableCache = cacheControl === 'no-cache';
    return this.artistsHandler.getWorksPaginated(Number(artistId), query, disableCache);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work by ID' })
  @ApiResponse({
    status: 200,
    description: 'Work retrieved successfully',
    type: WorkDto,
  })
  @ApiParam({ name: 'id', description: 'Work ID' })
  async getWorkById(
    @Param('id') id: number, 
    @Headers('cache-control') cacheControl?: string
  ): Promise<WorkDto> {
    const disableCache = cacheControl === 'no-cache';
    return this.artistsHandler.getWorkById(Number(id), disableCache);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new work' })
  @ApiResponse({
    status: 201,
    description: 'Work created successfully',
    type: WorkDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async createWork(
    @Body() createWorkDto: CreateWorkDto,
    @UploadedFile() file: FileInterface
  ): Promise<WorkDto> {
    return this.artistsHandler.createWork(createWorkDto, file);
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
    return this.artistsHandler.updateWork(Number(id), updateWorkDto);
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
    return this.artistsHandler.deleteWork(Number(id));
  }
}