import { FileInterceptor } from '@nest-lab/fastify-multer';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { PaginatedStencilResponseDto } from '../../domain/dtos/paginated-stencil-response.dto';
import { StencilQueryDto } from '../../domain/dtos/stencil-query.dto';
import {
  CreateStencilDto,
  StencilDto,
  UpdateStencilDto,
} from '../../domain/dtos/stencil.dto';
import { ArtistsHandler } from '../artists.handler';

@ApiTags('Stencils')
@Controller('stencils')
@UseGuards(AuthGuard)
export class StencilsController {
  constructor(private readonly artistsHandler: ArtistsHandler) {}

  @Get('artist/:artistId')
  @ApiOperation({ summary: 'Get stencils by artist ID' })
  @ApiResponse({
    status: 200,
    description: 'Stencils retrieved successfully',
    type: PaginatedStencilResponseDto,
  })
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  async getStencilsByArtistId(
    @Param('artistId') artistId: string,
    @Query() query: StencilQueryDto,
    @Headers('cache-control') cacheControl?: string,
  ): Promise<PaginatedStencilResponseDto> {
    const disableCache = cacheControl === 'no-cache';
    return this.artistsHandler.getStencils(artistId, query, disableCache);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stencil by ID' })
  @ApiResponse({
    status: 200,
    description: 'Stencil retrieved successfully',
    type: StencilDto,
  })
  @ApiParam({ name: 'id', description: 'Stencil ID' })
  async getStencilById(
    @Param('id') id: string,
    @Headers('cache-control') cacheControl?: string,
  ): Promise<StencilDto> {
    const disableCache = cacheControl === 'no-cache';
    return this.artistsHandler.getStencilById(id, disableCache);
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
    @Param('id') id: string,
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
  async deleteStencil(@Param('id') id: string): Promise<void> {
    return this.artistsHandler.deleteStencil(id);
  }
}
