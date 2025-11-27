import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { CreateTagDto } from '../../../tags/tag.dto';
import { PaginatedStencilResponseDto } from '../../domain/dtos/paginated-stencil-response.dto';
import {
  StencilSearchQueryDto,
  TagSuggestionQueryDto,
  TagSuggestionResponseDto,
} from '../../domain/dtos/stencil-search.dto';
import { ArtistsHandler } from '../artists.handler';

/**
 * Información detallada sobre el algoritmo de puntuación de relevancia
 */
class SearchRankingInfoDto {
  @ApiProperty({
    description: 'Nombre del factor de relevancia',
    example: 'title_exact_match',
  })
  factor: string;

  @ApiProperty({
    description: 'Descripción de cómo afecta este factor a la puntuación',
    example:
      'Si el título del estencil contiene exactamente la consulta de búsqueda',
  })
  description: string;

  @ApiProperty({
    description: 'Peso del factor en la puntuación de relevancia',
    example: 0.3,
  })
  weight: number;
}

@ApiTags('Stencil Search')
@UseGuards(AuthGuard)
@Controller('stencil-search')
export class StencilSearchController {
  constructor(private readonly artistsHandler: ArtistsHandler) {}

  @Get()
  @ApiOperation({
    summary: 'Búsqueda avanzada de estenciles con varios criterios',
  })
  @ApiOkResponse({
    description: 'Resultados de la búsqueda',
    type: PaginatedStencilResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchStencils(
    @Query() searchParams: StencilSearchQueryDto,
    @Headers('cache-control') cacheControl?: string,
  ): Promise<PaginatedStencilResponseDto> {
    const disableCache = cacheControl === 'no-cache';
    return this.artistsHandler.searchStencils({
      ...searchParams,
      disableCache,
    });
  }

  @Get('ranking-info')
  @ApiOperation({
    summary:
      'Obtener información sobre cómo se calcula la relevancia de los resultados de búsqueda',
  })
  @ApiOkResponse({
    description: 'Información sobre el algoritmo de ranking',
    type: [SearchRankingInfoDto],
  })
  async getRankingInfo(): Promise<SearchRankingInfoDto[]> {
    // Devolver información fija sobre cómo funciona nuestro algoritmo de ranking
    return [
      {
        factor: 'title_exact_match',
        description:
          'Coincidencia exacta del término de búsqueda en el título del estencil',
        weight: 0.3,
      },
      {
        factor: 'title_partial_match',
        description:
          'Coincidencia parcial de palabras del término de búsqueda en el título',
        weight: 0.2,
      },
      {
        factor: 'description_match',
        description:
          'Coincidencia del término de búsqueda en la descripción del estencil',
        weight: 0.2,
      },
      {
        factor: 'recent',
        description: 'Estencil creado en los últimos 30 días',
        weight: 0.15,
      },
      {
        factor: 'fairly_recent',
        description: 'Estencil creado en los últimos 90 días',
        weight: 0.05,
      },
      {
        factor: 'available',
        description: 'Estencil marcado como disponible',
        weight: 0.1,
      },
      {
        factor: 'popular',
        description: 'Estencil con alto número de visualizaciones',
        weight: 0.2,
      },
    ];
  }

  @Get('tags/suggest')
  @ApiOperation({
    summary: 'Obtener sugerencias de etiquetas mientras el usuario escribe',
  })
  @ApiOkResponse({
    description: 'Sugerencias de etiquetas',
    type: [TagSuggestionResponseDto],
  })
  @ApiQuery({
    name: 'prefix',
    required: true,
    description: 'Prefijo para buscar etiquetas',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de sugerencias',
    type: Number,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTagSuggestions(
    @Query() queryParams: TagSuggestionQueryDto,
  ): Promise<TagSuggestionResponseDto[]> {
    return this.artistsHandler.getTagSuggestions(queryParams);
  }

  @Get('tags/popular')
  @ApiOperation({ summary: 'Obtener las etiquetas más populares' })
  @ApiOkResponse({
    description: 'Etiquetas populares',
    type: [TagSuggestionResponseDto],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de etiquetas',
    type: Number,
  })
  async getPopularTags(
    @Query('limit') limit = 10,
  ): Promise<TagSuggestionResponseDto[]> {
    // Utilizar el mismo método de sugerencias pero sin prefijo para obtener etiquetas populares
    return this.artistsHandler.getTagSuggestions({ prefix: '', limit });
  }

  @Post('tags')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Crear una nueva etiqueta o devolver la existente si coincide el nombre',
  })
  @ApiOkResponse({
    description: 'Etiqueta creada o existente',
    type: TagSuggestionResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTag(
    @Body() createTagDto: CreateTagDto,
  ): Promise<TagSuggestionResponseDto> {
    return this.artistsHandler.createTag(createTagDto);
  }
}
