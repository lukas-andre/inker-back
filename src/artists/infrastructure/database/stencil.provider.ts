import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Stencil } from '../entities/stencil.entity';
import { CreateStencilDto, UpdateStencilDto } from '../../domain/dtos/stencil.dto';
import { Tag } from '../../../tags/tag.entity';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { TagsService } from '../../../tags/tags.service';
import { StencilSearchQueryDto } from '../../domain/dtos/stencil-search.dto';
import { Like } from 'typeorm';

@Injectable()
export class StencilProvider extends BaseComponent {
  constructor(
    @InjectRepository(Stencil, 'artist-db')
    private readonly stencilRepository: Repository<Stencil>,
    private readonly tagsService: TagsService,
  ) {
    super(StencilProvider.name);
  }

  async findStencilsByArtistId(artistId: number): Promise<Stencil[]> {
    return this.stencilRepository.find({
      where: { artistId, deletedAt: null },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailableStencilsByArtistId(artistId: number): Promise<Stencil[]> {
    return this.stencilRepository.find({
      where: { artistId, isHidden: false, deletedAt: null },
      relations: ['tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findStencilById(id: number): Promise<Stencil> {
    return this.stencilRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['tags'],
    });
  }

  async createStencil(artistId: number, createStencilDto: CreateStencilDto): Promise<Stencil> {
    const { tagIds, ...stencilData } = createStencilDto;

    const stencil = this.stencilRepository.create({
      ...stencilData,
      artistId,
    });

    if (tagIds && tagIds.length > 0) {
      stencil.tags = await this.tagsService.find({
        where: { id: In(tagIds) },
      });
    }

    return this.stencilRepository.save(stencil);
  }

  async updateStencil(id: number, updateStencilDto: UpdateStencilDto): Promise<Stencil> {
    const { tagIds, ...stencilData } = updateStencilDto;
    
    await this.stencilRepository.update(id, stencilData);
    
    const stencil = await this.stencilRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    
    if (tagIds) {
      stencil.tags = await this.tagsService.find({
        where: { id: In(tagIds) },
      });
      await this.stencilRepository.save(stencil);
    }
    
    return stencil;
  }

  async deleteStencil(id: number): Promise<void> {
    await this.stencilRepository.softDelete(id);
  }

  async countStencilsByArtistId(artistId: number): Promise<number> {
    return this.stencilRepository.count({
      where: { artistId, deletedAt: null },
    });
  }

  async findStencilsByArtistIdWithPagination(
    artistId: number,
    page: number = 1,
    limit: number = 10,
    isAvailable?: boolean
  ): Promise<[Stencil[], number]> {
    const queryBuilder = this.stencilRepository
      .createQueryBuilder('stencil')
      .leftJoinAndSelect('stencil.tags', 'tags')
      .where('stencil.artistId = :artistId', { artistId })
      .andWhere('stencil.deletedAt IS NULL');
    
    if (isAvailable !== undefined) {
      queryBuilder.andWhere('stencil.isAvailable = :isAvailable', { isAvailable });
    }
    
    queryBuilder.orderBy('stencil.createdAt', 'DESC');
    
    const offset = (page - 1) * limit;
    
    const [stencils, total] = await queryBuilder
      .take(limit)
      .skip(offset)
      .getManyAndCount();
    
    return [stencils, total];
  }

  /**
   * Búsqueda de estenciles con múltiples criterios y ordenamiento
   */
  async searchStencils(params: StencilSearchQueryDto): Promise<[Stencil[], number]> {
    const { 
      query, 
      tagIds, 
      artistId, 
      includeHidden, 
      sortBy = 'relevance', 
      page = 1, 
      limit = 10 
    } = params;

    // Crear query builder base
    const queryBuilder = this.stencilRepository
      .createQueryBuilder('stencil')
      .leftJoinAndSelect('stencil.tags', 'tags')
      .leftJoinAndSelect('stencil.artist', 'artist')
      .where('stencil.deletedAt IS NULL');

    // Aplicar filtro de búsqueda de texto
    if (query && query.trim() !== '') {
      // Base búsqueda de texto usando tsvector
      queryBuilder.andWhere(`
        stencil.tsv @@ plainto_tsquery('english', :query) OR
        stencil.tsv @@ plainto_tsquery('spanish', :query)
      `, { query });

      // Si ordenamos por relevancia, calculamos el ranking compuesto
      if (sortBy === 'relevance') {
        // Calcular relevancia compuesta con múltiples factores 
        // 1. Relevancia de texto (usando ts_rank con normalización)
        // 2. Exactitud del título (boost para coincidencias exactas)
        // 3. Reciente (boost para estenciles más recientes)
        // 4. Disponibilidad (boost para disponibles)
        queryBuilder.addSelect(`
          -- Relevancia básica de texto (normalizada)
          (ts_rank(stencil.tsv, plainto_tsquery('english', :query), 2) * 0.6) +
          (ts_rank(stencil.tsv, plainto_tsquery('spanish', :query), 2) * 0.6) +
          
          -- Boost para coincidencias en título (un factor adicional importante)
          (CASE WHEN stencil.title ILIKE :likeQuery THEN 0.4 ELSE 0 END) +
          
          -- Boost para estenciles más recientes (menor pero significativo)
          (CASE 
            WHEN stencil.created_at > NOW() - INTERVAL '30 days' THEN 0.2
            WHEN stencil.created_at > NOW() - INTERVAL '90 days' THEN 0.1
            ELSE 0
          END) +
          
          -- Pequeño boost para estenciles disponibles
          (CASE WHEN stencil.is_available = true THEN 0.1 ELSE 0 END)
        `, 'relevance_score');
        
        // Parámetro adicional para búsqueda de texto
        queryBuilder.setParameter('likeQuery', `%${query}%`);
        
        // Ordenar por esta métrica compuesta
        queryBuilder.orderBy('relevance_score', 'DESC');
      }
    }

    // Filtrar por etiquetas si se proporcionan
    if (tagIds && tagIds.length > 0) {
      queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds });
    }

    // Filtrar por artista si se proporciona
    if (artistId) {
      queryBuilder.andWhere('stencil.artistId = :artistId', { artistId });
    }

    // Filtrar por disponibilidad si se especifica
    if (includeHidden !== undefined) {
      queryBuilder.andWhere('stencil.isHidden = :includeHidden', { includeHidden });
    }

    // Aplicar orden según el parámetro sortBy
    switch (sortBy) {
      case 'relevance':
        if (!query || query.trim() === '') {
          // Si no hay query, ordenar por fecha de creación
          queryBuilder.orderBy('stencil.createdAt', 'DESC');
        }
        // Si hay query, ya aplicamos el ordenamiento por relevance_score arriba
        break;
      case 'newest':
        queryBuilder.orderBy('stencil.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('stencil.createdAt', 'ASC');
        break;
      default:
        queryBuilder.orderBy('stencil.createdAt', 'DESC');
    }

    // Aplicar paginación
    const offset = (page - 1) * limit;
    queryBuilder.take(limit).skip(offset);

    // Ejecutar la consulta y obtener resultados con recuento total
    const [stencils, total] = await queryBuilder.getManyAndCount();
    
    return [stencils, total];
  }

  /**
   * Obtener sugerencias de etiquetas basadas en un prefijo
   */
  async findTagSuggestions(prefix: string, limit: number = 10): Promise<Tag[]> {
    const tags = await this.tagsService.find({
      where: { name: Like(`${prefix}%`) },
      take: limit,
      order: { name: 'ASC' }
    });

    return tags;
  }

  /**
   * Obtener las etiquetas más utilizadas para estenciles
   */
  async findPopularTags(limit: number = 10): Promise<{ id: number; name: string; count: number }[]> {
    // Consulta SQL para obtener las etiquetas más utilizadas con el recuento
    const result = await this.stencilRepository.query(`
      SELECT 
        t.id, 
        t.name, 
        COUNT(st.stencil_id) as count
      FROM 
        tags t
      JOIN 
        stencil_tags st ON t.id = st.tag_id
      JOIN 
        stencils s ON st.stencil_id = s.id
      WHERE 
        s.deleted_at IS NULL
      GROUP BY 
        t.id, t.name
      ORDER BY 
        count DESC
      LIMIT $1
    `, [limit]);

    return result.map(tag => ({
      id: Number(tag.id),
      name: tag.name,
      count: Number(tag.count)
    }));
  }
}