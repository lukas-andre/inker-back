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
import { PaginatedWorkResponseDto } from '../../domain/dtos/paginated-work-response.dto';
import {
  WorkSearchQueryDto,
  WorkTagSuggestionQueryDto,
  WorkTagSuggestionResponseDto,
} from '../../domain/dtos/work-search.dto';
import { ArtistsHandler } from '../artists.handler';

/**
 * Información detallada sobre el algoritmo de puntuación de relevancia
 */
class WorkSearchRankingInfoDto {
  @ApiProperty({
    description: 'Nombre del factor de relevancia',
    example: 'title_exact_match',
  })
  factor: string;

  @ApiProperty({
    description: 'Descripción de cómo afecta este factor a la puntuación',
    example:
      'Si el título del trabajo contiene exactamente la consulta de búsqueda',
  })
  description: string;

  @ApiProperty({
    description: 'Peso del factor en la puntuación de relevancia',
    example: 0.3,
  })
  weight: number;
}

@ApiTags('Work Search')
@UseGuards(AuthGuard)
@Controller('work-search')
export class WorkSearchController {
  constructor(private readonly artistsHandler: ArtistsHandler) {}

  @Get()
  @ApiOperation({
    summary: 'Búsqueda avanzada de trabajos con varios criterios',
  })
  @ApiOkResponse({
    description: 'Resultados de la búsqueda',
    type: PaginatedWorkResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchWorks(
    @Query() searchParams: WorkSearchQueryDto,
    @Headers('cache-control') cacheControl?: string,
  ): Promise<PaginatedWorkResponseDto> {
    const disableCache = cacheControl === 'no-cache';
    return this.artistsHandler.searchWorks({
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
    type: [WorkSearchRankingInfoDto],
  })
  async getRankingInfo(): Promise<WorkSearchRankingInfoDto[]> {
    // Devolver información fija sobre cómo funciona nuestro algoritmo de ranking
    return [
      {
        factor: 'title_exact_match',
        description:
          'Coincidencia exacta del término de búsqueda en el título del trabajo',
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
          'Coincidencia del término de búsqueda en la descripción del trabajo',
        weight: 0.2,
      },
      {
        factor: 'recent',
        description: 'Trabajo creado en los últimos 30 días',
        weight: 0.15,
      },
      {
        factor: 'fairly_recent',
        description: 'Trabajo creado en los últimos 90 días',
        weight: 0.05,
      },
      {
        factor: 'featured',
        description: 'Trabajo marcado como destacado',
        weight: 0.2,
      },
      {
        factor: 'popular',
        description: 'Trabajo con alto número de visualizaciones',
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
    type: [WorkTagSuggestionResponseDto],
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
    @Query() queryParams: WorkTagSuggestionQueryDto,
  ): Promise<WorkTagSuggestionResponseDto[]> {
    return this.artistsHandler.getWorkTagSuggestions(queryParams);
  }

  @Get('tags/popular')
  @ApiOperation({
    summary: 'Obtener las etiquetas más populares para trabajos',
  })
  @ApiOkResponse({
    description: 'Etiquetas populares',
    type: [WorkTagSuggestionResponseDto],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de etiquetas',
    type: Number,
  })
  async getPopularTags(
    @Query('limit') limit = 10,
  ): Promise<WorkTagSuggestionResponseDto[]> {
    // Utilizar el mismo método de sugerencias pero sin prefijo para obtener etiquetas populares
    return this.artistsHandler.getWorkTagSuggestions({ prefix: '', limit });
  }

  @Post('tags')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Crear una nueva etiqueta o devolver la existente si coincide el nombre',
  })
  @ApiOkResponse({
    description: 'Etiqueta creada o existente',
    type: WorkTagSuggestionResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTag(
    @Body() createTagDto: CreateTagDto,
  ): Promise<WorkTagSuggestionResponseDto> {
    return this.artistsHandler.createTag(createTagDto);
  }
}
