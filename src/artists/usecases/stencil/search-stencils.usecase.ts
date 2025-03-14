import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { StencilProvider } from '../../infrastructure/database/stencil.provider';
import { StencilSearchQueryDto } from '../../domain/dtos/stencil-search.dto';
import { PaginatedStencilResponseDto, StencilWithRelevanceDto } from '../../domain/dtos/paginated-stencil-response.dto';
import { InteractionProvider } from '../../../interactions/infrastructure/database/interaction.provider';

@Injectable()
export class SearchStencilsUseCase extends BaseUseCase {
  constructor(
    private readonly stencilProvider: StencilProvider,
    private readonly interactionProvider: InteractionProvider,
  ) {
    super(SearchStencilsUseCase.name);
  }

  async execute(params: StencilSearchQueryDto): Promise<PaginatedStencilResponseDto> {
    const { query, page = 1, limit = 10, sortBy = 'relevance' } = params;

    // Usar el método searchStencils del provider para buscar estenciles
    const [stencils, total] = await this.stencilProvider.searchStencils(params);

    // Enriquecer los resultados con información de relevancia y popularidad
    const enrichedStencils: StencilWithRelevanceDto[] = await this.enrichSearchResults(stencils, query, sortBy);

    // Calcular páginas totales
    const pages = Math.ceil(total / limit);

    // Crear respuesta paginada
    return {
      items: enrichedStencils,
      page,
      limit,
      total,
      pages,
    };
  }

  /**
   * Enriquece los resultados de búsqueda con información de relevancia
   */
  private async enrichSearchResults(
    stencils: any[], 
    searchQuery?: string, 
    sortBy: string = 'relevance'
  ): Promise<StencilWithRelevanceDto[]> {
    // Si no hay estenciles, devolver array vacío
    if (!stencils.length) return [];

    // Si estamos ordenando por relevancia y hay query de búsqueda
    if (sortBy === 'relevance' && searchQuery && searchQuery.trim() !== '') {
      // Obtener métricas de popularidad para los estenciles
      const stencilIds = stencils.map(stencil => stencil.id);
      let popularityData: { entityId: number; count: number }[] = [];
      
      try {
        popularityData = await this.interactionProvider.getRecentPopularEntities(
          'stencil',
          'view',
          stencilIds.length,
          30 // Últimos 30 días
        );
      } catch (error) {
        this.logger.error('Error al obtener datos de popularidad', error);
      }

      // Crear mapa de popularidad
      const popularityMap = new Map<number, number>();
      popularityData.forEach(item => {
        popularityMap.set(item.entityId, item.count);
      });

      // Regex para verificar coincidencias de palabras completas
      const searchTerms = searchQuery.trim().toLowerCase().split(/\s+/);
      const searchRegexes = searchTerms.map(term => new RegExp(`\\b${term}\\b`, 'i'));

      // Enriquecer cada estencil
      return stencils.map(stencil => {
        const result: StencilWithRelevanceDto = { ...stencil };
        const relevanceFactors: string[] = [];
        let baseScore = 0.5; // Puntuación base
        
        // Factor 1: Coincidencia en título
        if (stencil.title && typeof stencil.title === 'string') {
          const titleLower = stencil.title.toLowerCase();
          // Verificar coincidencia exacta o parcial
          if (titleLower.includes(searchQuery.toLowerCase())) {
            baseScore += 0.3;
            relevanceFactors.push('title_exact_match');
          } else {
            // Verificar coincidencia de palabras individuales
            const matchCount = searchRegexes.filter(regex => regex.test(titleLower)).length;
            if (matchCount > 0) {
              const matchScore = Math.min(0.2, matchCount * 0.05);
              baseScore += matchScore;
              relevanceFactors.push('title_partial_match');
            }
          }
        }
        
        // Factor 2: Coincidencia en descripción
        if (stencil.description && typeof stencil.description === 'string') {
          const descLower = stencil.description.toLowerCase();
          if (descLower.includes(searchQuery.toLowerCase())) {
            baseScore += 0.2;
            relevanceFactors.push('description_match');
          }
        }
        
        // Factor 3: Reciente
        const createdAt = stencil.createdAt ? new Date(stencil.createdAt) : null;
        if (createdAt) {
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          
          if (createdAt > thirtyDaysAgo) {
            baseScore += 0.15;
            relevanceFactors.push('recent');
          } else if (createdAt > ninetyDaysAgo) {
            baseScore += 0.05;
            relevanceFactors.push('fairly_recent');
          }
        }
        
        // Factor 4: Disponibilidad
        if (stencil.isAvailable) {
          baseScore += 0.1;
          relevanceFactors.push('available');
        }
        
        // Factor 5: Popularidad (basada en visualizaciones)
        const viewCount = popularityMap.get(stencil.id) || 0;
        if (viewCount > 0) {
          // Normalizar vistas entre 0-0.2
          const viewScore = Math.min(0.2, viewCount * 0.01);
          baseScore += viewScore;
          relevanceFactors.push('popular');
        }
        
        // Asignar puntuación final (máximo 1.0)
        result.relevanceScore = Math.min(1.0, baseScore);
        result.relevanceFactors = relevanceFactors;
        
        return result;
      });
    } else if (sortBy === 'popularity') {
      // Si ordenamos por popularidad, obtener datos de popularidad
      try {
        const stencilIds = stencils.map(stencil => stencil.id);
        const popularStencils = await this.interactionProvider.getRecentPopularEntities(
          'stencil',
          'view',
          stencilIds.length,
          30
        );

        // Crear mapa de popularidad
        const popularityMap = new Map<number, number>();
        popularStencils.forEach(item => {
          popularityMap.set(item.entityId, item.count);
        });

        // Ordenar estenciles por cantidad de visualizaciones
        stencils.sort((a, b) => {
          const aCount = popularityMap.get(a.id) || 0;
          const bCount = popularityMap.get(b.id) || 0;
          return bCount - aCount;
        });

        // Añadir información de popularidad
        return stencils.map(stencil => {
          const viewCount = popularityMap.get(stencil.id) || 0;
          const result: StencilWithRelevanceDto = { ...stencil };
          
          if (viewCount > 0) {
            result.relevanceScore = Math.min(1.0, viewCount * 0.01);
            result.relevanceFactors = ['popular'];
          }
          
          return result;
        });
      } catch (error) {
        this.logger.error('Error ordenando por popularidad', error);
      }
    }
    
    // Para otros casos, devolver los estenciles sin información de relevancia
    return stencils.map(stencil => ({ ...stencil }));
  }
} 