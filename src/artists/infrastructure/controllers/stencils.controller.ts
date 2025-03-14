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
import { CreateStencilDto, UpdateStencilDto, StencilDto } from '../../domain/dtos/stencil.dto';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { StencilQueryDto } from '../../domain/dtos/stencil-query.dto';
import { PaginatedStencilResponseDto } from '../../domain/dtos/paginated-stencil-response.dto';

@ApiTags('Stencils')
@Controller('stencils')
export class StencilsController {
  constructor(
    private readonly artistsHandler: ArtistsHandler,
    private readonly requestContext: RequestContextService,
    private readonly multimediasService: MultimediasService
  ) {}

  @Get('artist/:artistId')
  @ApiOperation({ summary: 'Get stencils by artist ID' })
  @ApiResponse({
    status: 200,
    description: 'Stencils retrieved successfully',
    type: PaginatedStencilResponseDto,
  })
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  async getStencilsByArtistId(
    @Param('artistId', ParseIntPipe) artistId: number,
    @Query() query: StencilQueryDto,
  ): Promise<PaginatedStencilResponseDto> {
    return this.artistsHandler.getStencils(artistId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stencil by ID' })
  @ApiResponse({
    status: 200,
    description: 'Stencil retrieved successfully',
    type: StencilDto,
  })
  @ApiParam({ name: 'id', description: 'Stencil ID' })
  async getStencilById(@Param('id') id: number): Promise<StencilDto> {
    return this.artistsHandler.getStencilById(Number(id));
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new stencil' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 201,
    description: 'Stencil created successfully',
    type: StencilDto,
  })
  async createStencil(
    @Body() createStencilDto: CreateStencilDto,
    @UploadedFile() file: FileInterface,
  ): Promise<StencilDto> {
    return this.artistsHandler.createStencil(createStencilDto, file);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a stencil' })
  @ApiResponse({
    status: 200,
    description: 'Stencil updated successfully',
    type: StencilDto,
  })
  @ApiParam({ name: 'id', description: 'Stencil ID' })
  async updateStencil(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStencilDto: UpdateStencilDto,
  ): Promise<StencilDto> {
    return this.artistsHandler.updateStencil(id, updateStencilDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a stencil' })
  @ApiResponse({
    status: 200,
    description: 'Stencil deleted successfully',
  })
  @ApiParam({ name: 'id', description: 'Stencil ID' })
  async deleteStencil(
    @Param('id') id: number,
  ): Promise<void> {
    return this.artistsHandler.deleteStencil(Number(id));
  }
}