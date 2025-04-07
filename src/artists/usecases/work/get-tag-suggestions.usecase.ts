import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { WorkTagSuggestionQueryDto, WorkTagSuggestionResponseDto } from '../../domain/dtos/work-search.dto';

@Injectable()
export class GetWorkTagSuggestionsUseCase extends BaseUseCase {
  constructor(private readonly workProvider: WorkProvider) {
    super(GetWorkTagSuggestionsUseCase.name);
  }

  async execute(params: WorkTagSuggestionQueryDto): Promise<WorkTagSuggestionResponseDto[]> {
    const { prefix, limit = 10 } = params;

    try {
      if (!prefix || prefix.trim().length < 1) {
        // Si no hay prefijo, devolver las etiquetas más populares
        const popularTags = await this.workProvider.findPopularTags(limit);
        return popularTags;
      }

      // Buscar etiquetas que coincidan con el prefijo
      const tags = await this.workProvider.findTagSuggestions(prefix, limit);

      // Mapear a DTO de respuesta
      return tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        // No incluimos el recuento aquí, ya que no es calculado en findTagSuggestions
      }));
    } catch (error) {
      this.logger.error(`Error al obtener sugerencias de etiquetas para trabajos`, error);
      return [];
    }
  }
} 