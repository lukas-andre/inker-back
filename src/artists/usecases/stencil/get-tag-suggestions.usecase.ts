import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { StencilProvider } from '../../infrastructure/database/stencil.provider';
import { TagSuggestionQueryDto, TagSuggestionResponseDto } from '../../domain/dtos/stencil-search.dto';

@Injectable()
export class GetTagSuggestionsUseCase extends BaseUseCase {
  constructor(private readonly stencilProvider: StencilProvider) {
    super(GetTagSuggestionsUseCase.name);
  }

  async execute(params: TagSuggestionQueryDto): Promise<TagSuggestionResponseDto[]> {
    const { prefix, limit = 10 } = params;

    try {
      if (!prefix || prefix.trim().length < 1) {
        // Si no hay prefijo, devolver las etiquetas más populares
        const popularTags = await this.stencilProvider.findPopularTags(limit);
        return popularTags;
      }

      // Buscar etiquetas que coincidan con el prefijo
      const tags = await this.stencilProvider.findTagSuggestions(prefix, limit);

      // Mapear a DTO de respuesta
      return tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        // No incluimos el recuento aquí, ya que no es calculado en findTagSuggestions
      }));
    } catch (error) {
      this.logger.error(`Error al obtener sugerencias de etiquetas`, error);
      return [];
    }
  }
} 