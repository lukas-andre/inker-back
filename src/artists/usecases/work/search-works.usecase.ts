import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { WorkSearchQueryDto } from '../../domain/dtos/work-search.dto';
import { PaginatedWorkResponseDto, WorkWithRelevanceDto } from '../../domain/dtos/paginated-work-response.dto';
import { InteractionProvider } from '../../../interactions/infrastructure/database/interaction.provider';
import { WorkDto } from '../../domain/dtos/work.dto';

@Injectable()
export class SearchWorksUseCase extends BaseUseCase {
  constructor(
    private readonly workProvider: WorkProvider,
    private readonly interactionProvider: InteractionProvider,
  ) {
    super(SearchWorksUseCase.name);
  }

  async execute(params: WorkSearchQueryDto): Promise<PaginatedWorkResponseDto> {
    const { query, page = 1, limit = 10, sortBy = 'relevance' } = params;

    // Usar el método searchWorks del provider para buscar trabajos
    const [works, total] = await this.workProvider.searchWorks(params);

    // Enriquecer los resultados con información de relevancia y popularidad
    const enrichedWorks: WorkWithRelevanceDto[] = await this.enrichSearchResults(works, query, sortBy);

    // Calcular páginas totales
    const pages = Math.ceil(total / limit);
    
    // Crear respuesta paginada
    return {
      items: enrichedWorks,
      page,
      limit,
      total,
      pages
    };
  }

  /**
   * Enriquece los resultados de búsqueda con información de relevancia
   */
  private async enrichSearchResults(
    works: any[], 
    searchQuery?: string, 
    sortBy: string = 'relevance'
  ): Promise<WorkWithRelevanceDto[]> {
    // Si no hay trabajos, devolver array vacío
    if (!works.length) return [];

    // Si estamos ordenando por relevancia y hay query de búsqueda
    if (sortBy === 'relevance' && searchQuery && searchQuery.trim() !== '') {
      // Obtener métricas de popularidad para los trabajos
      const workIds = works.map(work => work.id);
      let popularityData: { entityId: number; count: number }[] = [];
      
      try {
        popularityData = await this.interactionProvider.getRecentPopularEntities(
          'work',
          'view',
          workIds.length,
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

      // Enriquecer cada trabajo
      return works.map(work => {
        const result: WorkWithRelevanceDto = { ...work };
        const relevanceFactors: string[] = [];
        let baseScore = 0.5; // Puntuación base
        
        // Factor 1: Coincidencia en título
        if (work.title && typeof work.title === 'string') {
          const titleLower = work.title.toLowerCase();
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
        if (work.description && typeof work.description === 'string') {
          const descLower = work.description.toLowerCase();
          if (descLower.includes(searchQuery.toLowerCase())) {
            baseScore += 0.2;
            relevanceFactors.push('description_match');
          }
        }
        
        // Factor 3: Reciente
        const createdAt = work.createdAt ? new Date(work.createdAt) : null;
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
        
        // Factor 4: Destacado
        if (work.isFeatured) {
          baseScore += 0.2;
          relevanceFactors.push('featured');
        }
        
        // Factor 5: Popularidad (basada en visualizaciones)
        const viewCount = popularityMap.get(work.id) || 0;
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
        const workIds = works.map(work => work.id);
        const popularWorks = await this.interactionProvider.getRecentPopularEntities(
          'work',
          'view',
          workIds.length,
          30
        );

        // Crear mapa de popularidad
        const popularityMap = new Map<number, number>();
        popularWorks.forEach(item => {
          popularityMap.set(item.entityId, item.count);
        });

        // Ordenar trabajos por cantidad de visualizaciones
        works.sort((a, b) => {
          const aCount = popularityMap.get(a.id) || 0;
          const bCount = popularityMap.get(b.id) || 0;
          return bCount - aCount;
        });

        // Añadir información de popularidad
        return works.map(work => {
          const viewCount = popularityMap.get(work.id) || 0;
          const result: WorkWithRelevanceDto = { ...work };
          
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
    
    // Para otros casos, devolver los trabajos sin información de relevancia
    return works.map(work => ({ ...work }));
  }
} 