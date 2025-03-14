import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Work } from '../entities/work.entity';
import { CreateWorkDto, UpdateWorkDto } from '../../domain/dtos/work.dto';
import { Tag } from '../../../tags/tag.entity';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { TagsService } from '../../../tags/tags.service';
import { WorkSearchQueryDto } from '../../domain/dtos/work-search.dto';

@Injectable()
export class WorkProvider extends BaseComponent {
  constructor(
    @InjectRepository(Work, 'artist-db')
    private readonly workRepository: Repository<Work>,
    private readonly tagsService: TagsService,
  ) {
    super(WorkProvider.name);
  }

  async findWorksByArtistId(artistId: number): Promise<Work[]> {
    return this.workRepository.find({
      where: { artistId, deletedAt: null },
      relations: ['tags'],
      order: { orderPosition: 'ASC', createdAt: 'DESC' },
    });
  }

  async findFeaturedWorksByArtistId(artistId: number): Promise<Work[]> {
    return this.workRepository.find({
      where: { artistId, isFeatured: true, deletedAt: null },
      relations: ['tags'],
      order: { orderPosition: 'ASC', createdAt: 'DESC' },
    });
  }

  async findWorkById(id: number): Promise<Work> {
    return this.workRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['tags'],
    });
  }

  async createWork(artistId: number, createWorkDto: CreateWorkDto): Promise<Work> {
    const { tagIds, ...workData } = createWorkDto;

    const work = this.workRepository.create({
      ...workData,
      artistId,
    });

    if (tagIds && tagIds.length > 0) {
      work.tags = await this.tagsService.find({
        where: { id: In(tagIds) },
      });
    }

    return this.workRepository.save(work);
  }

  async updateWork(id: number, updateWorkDto: UpdateWorkDto): Promise<Work> {
    const { tagIds, ...workData } = updateWorkDto;
    
    await this.workRepository.update(id, workData);
    
    const work = await this.workRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    
    if (tagIds) {
      work.tags = await this.tagsService.find({
        where: { id: In(tagIds) },
      });
      await this.workRepository.save(work);
    }
    
    return work;
  }

  async deleteWork(id: number): Promise<void> {
    await this.workRepository.softDelete(id);
  }

  async countWorksByArtistId(artistId: number): Promise<number> {
    return this.workRepository.count({
      where: { artistId, deletedAt: null },
    });
  }

  async findWorksByArtistIdWithPagination(
    artistId: number,
    page: number = 1,
    limit: number = 10,
    isFeatured?: boolean
  ): Promise<[Work[], number]> {
    const queryBuilder = this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.tags', 'tags')
      .where('work.artistId = :artistId', { artistId })
      .andWhere('work.deletedAt IS NULL');
    
    if (isFeatured !== undefined) {
      queryBuilder.andWhere('work.isFeatured = :isFeatured', { isFeatured });
    }
    
    queryBuilder.orderBy('work.orderPosition', 'ASC')
                .addOrderBy('work.createdAt', 'DESC');
    
    const offset = (page - 1) * limit;
    
    const [works, total] = await queryBuilder
      .take(limit)
      .skip(offset)
      .getManyAndCount();
    
    return [works, total];
  }

  /**
   * Búsqueda de trabajos con múltiples criterios y ordenamiento
   */
  async searchWorks(params: WorkSearchQueryDto): Promise<[Work[], number]> {
    const { 
      query, 
      tagIds, 
      artistId, 
      onlyFeatured, 
      sortBy = 'relevance', 
      page = 1, 
      limit = 10 
    } = params;

    // Crear query builder base
    const queryBuilder = this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.tags', 'tags')
      .leftJoinAndSelect('work.artist', 'artist')
      .where('work.deletedAt IS NULL');

    // Aplicar filtro de búsqueda de texto
    if (query && query.trim() !== '') {
      // Base búsqueda de texto usando tsvector
      queryBuilder.andWhere(`
        work.tsv @@ plainto_tsquery('english', :query) OR
        work.tsv @@ plainto_tsquery('spanish', :query)
      `, { query });

      // Si ordenamos por relevancia, calculamos el ranking compuesto
      if (sortBy === 'relevance') {
        // Calcular relevancia compuesta con múltiples factores 
        // 1. Relevancia de texto (usando ts_rank con normalización)
        // 2. Exactitud del título (boost para coincidencias exactas)
        // 3. Reciente (boost para trabajos más recientes)
        // 4. Featured (boost para trabajos destacados)
        queryBuilder.addSelect(`
          -- Relevancia básica de texto (normalizada)
          (ts_rank(work.tsv, plainto_tsquery('english', :query), 2) * 0.6) +
          (ts_rank(work.tsv, plainto_tsquery('spanish', :query), 2) * 0.6) +
          
          -- Boost para coincidencias en título (un factor adicional importante)
          (CASE WHEN work.title ILIKE :likeQuery THEN 0.4 ELSE 0 END) +
          
          -- Boost para trabajos más recientes (menor pero significativo)
          (CASE 
            WHEN work.created_at > NOW() - INTERVAL '30 days' THEN 0.2
            WHEN work.created_at > NOW() - INTERVAL '90 days' THEN 0.1
            ELSE 0
          END) +
          
          -- Boost para trabajos destacados
          (CASE WHEN work.is_featured = true THEN 0.2 ELSE 0 END)
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
      queryBuilder.andWhere('work.artistId = :artistId', { artistId });
    }

    // Filtrar por destacado si se especifica
    if (onlyFeatured !== undefined) {
      queryBuilder.andWhere('work.isFeatured = :onlyFeatured', { onlyFeatured });
    }

    // Aplicar orden según el parámetro sortBy
    switch (sortBy) {
      case 'relevance':
        if (!query || query.trim() === '') {
          // Si no hay query, ordenar por posición y fecha de creación
          queryBuilder.orderBy('work.orderPosition', 'ASC')
                     .addOrderBy('work.createdAt', 'DESC');
        }
        // Si hay query, ya aplicamos el ordenamiento por relevance_score arriba
        break;
      case 'newest':
        queryBuilder.orderBy('work.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('work.createdAt', 'ASC');
        break;
      case 'popularity':
        // Para ordenar por popularidad, necesitaríamos una relación con interacciones o visualizaciones
        // Como simplificación, podemos dar prioridad a trabajos destacados y luego por fecha
        queryBuilder.orderBy('work.isFeatured', 'DESC')
                   .addOrderBy('work.createdAt', 'DESC');
        break;
      case 'position':
        queryBuilder.orderBy('work.orderPosition', 'ASC')
                   .addOrderBy('work.createdAt', 'DESC');
        break;
      default:
        queryBuilder.orderBy('work.orderPosition', 'ASC')
                   .addOrderBy('work.createdAt', 'DESC');
    }

    // Aplicar paginación
    const offset = (page - 1) * limit;
    queryBuilder.take(limit).skip(offset);

    // Ejecutar la consulta y obtener resultados con recuento total
    const [works, total] = await queryBuilder.getManyAndCount();
    
    return [works, total];
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
   * Obtener las etiquetas más utilizadas para trabajos
   */
  async findPopularTags(limit: number = 10): Promise<{ id: number; name: string; count: number }[]> {
    // Consulta SQL para obtener las etiquetas más utilizadas con el recuento
    const result = await this.workRepository.query(`
      SELECT 
        t.id, 
        t.name, 
        COUNT(wt.work_id) as count
      FROM 
        tags t
      JOIN 
        work_tags wt ON t.id = wt.tag_id
      JOIN 
        works w ON wt.work_id = w.id
      WHERE 
        w.deleted_at IS NULL
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