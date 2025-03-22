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
import { StencilStatus } from '../../domain/stencilType';

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

  async createStencil(artistId: number, createStencilDto: CreateStencilDto, isFeatured: boolean = false, isHidden: boolean = false): Promise<Stencil> {
    const { tagIds, ...stencilData } = createStencilDto;

    // Using a query runner to allow for a transaction
    const queryRunner = this.stencilRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Use raw query to insert with tsv value computed directly
      const textSearchFields = `${stencilData.title || ''} ${stencilData.description || ''}`;
      const insertResult = await queryRunner.query(`
        INSERT INTO stencils (
          artist_id, title, description, image_url, image_id, image_version, 
          thumbnail_url, thumbnail_version, is_featured, order_position, 
          price, status, is_hidden, tsv, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 
          $7, $8, $9, $10, 
          $11, $12, $13, to_tsvector('english', $14) || to_tsvector('spanish', $14), NOW(), NOW()
        ) RETURNING id
      `, [
        artistId,
        stencilData.title,
        stencilData.description,
        stencilData.imageUrl,
        stencilData.imageId,
        stencilData.imageVersion || 0,
        stencilData.thumbnailUrl,
        0, // Default thumbnailVersion to 0 since it's not in CreateStencilDto
        isFeatured,
        stencilData.orderPosition || 0,
        stencilData.price,
        stencilData.status || StencilStatus.AVAILABLE,
        isHidden,
        textSearchFields
      ]);

      const stencilId = insertResult[0].id;

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        // Get the tags
        const tagIdsArray = Array.isArray(tagIds) ? tagIds : tagIds.split(',').map(Number);
        const tags = await this.tagsService.find({
          where: { id: In(tagIdsArray) },
        });

        // Create tag relationships using join table
        for (const tag of tags) {
          await queryRunner.query(`
            INSERT INTO stencil_tags (stencil_id, tag_id)
            VALUES ($1, $2)
          `, [stencilId, tag.id]);
        }
      }

      // Increment the appropriate counters
      if (isHidden) {
        // For hidden stencils, only increment the total counter
        await queryRunner.query(`
          UPDATE artists
          SET stencils_count = stencils_count + 1
          WHERE id = $1
        `, [artistId]);
      } else {
        // For visible stencils, increment both counters
        await queryRunner.query(`
          UPDATE artists
          SET stencils_count = stencils_count + 1,
              visible_stencils_count = visible_stencils_count + 1
          WHERE id = $1
        `, [artistId]);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Return the complete stencil entity
      return this.findStencilById(stencilId);
    } catch (error) {
      // If anything fails, rollback the transaction
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating stencil', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async updateStencil(id: number, updateStencilDto: UpdateStencilDto, isFeatured: boolean, isHidden: boolean): Promise<Stencil> {
    const { tagIds, ...stencilData } = updateStencilDto;
    
    // First, get the current stencil data to handle visibility changes
    const currentStencil = await this.findStencilById(id);
    if (!currentStencil) {
      throw new Error(`Stencil with id ${id} not found`);
    }
    
    const artistId = currentStencil.artistId;
    const wasHidden = currentStencil.isHidden;
    
    // Using a query runner to allow for a transaction
    const queryRunner = this.stencilRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // First, update the stencil data
      if (Object.keys(stencilData).length > 0) {
        // Build SET clause dynamically from provided data
        const updateFields = [];
        const params = [];
        let paramIndex = 1;
        
        // Add each field that's provided in the DTO
        for (const [key, value] of Object.entries(stencilData)) {
          if (value !== undefined) {
            // Convert camelCase to snake_case for column names
            const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            updateFields.push(`${columnName} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
          }
        }
        
        // Add featured and hidden flags manually since they're handled separately
        updateFields.push(`is_featured = $${paramIndex}`);
        params.push(isFeatured);
        paramIndex++;
        
        updateFields.push(`is_hidden = $${paramIndex}`);
        params.push(isHidden);
        paramIndex++;
        
        // Also update updated_at
        updateFields.push(`updated_at = NOW()`);
        
        // Execute the update
        await queryRunner.query(`
          UPDATE stencils 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
        `, [...params, id]);
      } else {
        // If no other fields to update, just update the featured and hidden flags
        await queryRunner.query(`
          UPDATE stencils 
          SET is_featured = $1, is_hidden = $2, updated_at = NOW()
          WHERE id = $3
        `, [isFeatured, isHidden, id]);
      }
      
      // If the visibility state changed, update the appropriate counters
      if (wasHidden !== isHidden) {
        if (isHidden) {
          // Stencil changed from visible to hidden, decrement visible counter
          await queryRunner.query(`
            UPDATE artists
            SET visible_stencils_count = visible_stencils_count - 1
            WHERE id = $1 AND visible_stencils_count > 0
          `, [artistId]);
        } else {
          // Stencil changed from hidden to visible, increment visible counter
          await queryRunner.query(`
            UPDATE artists
            SET visible_stencils_count = visible_stencils_count + 1
            WHERE id = $1
          `, [artistId]);
        }
      }
      
      // Get the current stencil data to update tsv
      const stencilData2 = await queryRunner.query(
        `SELECT title, description FROM stencils WHERE id = $1`,
        [id]
      );
      
      // Only update tsv if title or description fields were updated or stencilData2 exists
      if ((stencilData.title || stencilData.description) && stencilData2.length > 0) {
        // Combine original fields with updates for tsv computation
        const title = stencilData.title || stencilData2[0].title || '';
        const description = stencilData.description || stencilData2[0].description || '';
        
        // Update the tsv field
        await queryRunner.query(`
          UPDATE stencils 
          SET tsv = to_tsvector('english', $1 || ' ' || $2) || to_tsvector('spanish', $1 || ' ' || $2)
          WHERE id = $3
        `, [title, description, id]);
      }
      
      // Update tag relationships if specified
      if (tagIds !== undefined) {
        // First, remove existing tag relationships
        await queryRunner.query(`
          DELETE FROM stencil_tags
          WHERE stencil_id = $1
        `, [id]);
        
        // Then add new tag relationships
        if (tagIds && tagIds.length > 0) {
          const tags = await this.tagsService.find({
            where: { id: In(tagIds) },
          });
          
          for (const tag of tags) {
            await queryRunner.query(`
              INSERT INTO stencil_tags (stencil_id, tag_id)
              VALUES ($1, $2)
            `, [id, tag.id]);
          }
        }
      }
      
      // Commit the transaction
      await queryRunner.commitTransaction();
      
      // Return the updated stencil with tags
      return this.findStencilById(id);
    } catch (error) {
      // If anything fails, rollback the transaction
      await queryRunner.rollbackTransaction();
      this.logger.error('Error updating stencil', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async deleteStencil(id: number): Promise<void> {
    // Get the stencil first to retrieve its artistId and hidden status
    const stencil = await this.findStencilById(id);
    if (!stencil) return;
    
    const artistId = stencil.artistId;
    const isHidden = stencil.isHidden;
    
    // Using a query runner to allow for a transaction
    const queryRunner = this.stencilRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Soft delete the stencil
      await queryRunner.query(`
        UPDATE stencils
        SET deleted_at = NOW()
        WHERE id = $1
      `, [id]);
      
      // Update the appropriate counters based on the stencil's visibility
      if (isHidden) {
        // If the stencil was hidden, only decrement the total counter
        await queryRunner.query(`
          UPDATE artists
          SET stencils_count = stencils_count - 1
          WHERE id = $1 AND stencils_count > 0
        `, [artistId]);
      } else {
        // If the stencil was visible, decrement both counters
        await queryRunner.query(`
          UPDATE artists
          SET stencils_count = stencils_count - 1,
              visible_stencils_count = visible_stencils_count - 1
          WHERE id = $1 AND stencils_count > 0 AND visible_stencils_count > 0
        `, [artistId]);
      }
      
      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // If anything fails, rollback the transaction
      await queryRunner.rollbackTransaction();
      this.logger.error('Error deleting stencil', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
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
    status?: StencilStatus,
    includeHidden: boolean = false
  ): Promise<[Stencil[], number]> {
    const queryBuilder = this.stencilRepository
      .createQueryBuilder('stencil')
      .leftJoinAndSelect('stencil.tags', 'tags')
      .where('stencil.artistId = :artistId', { artistId })
      .andWhere('stencil.deletedAt IS NULL');
    
    // Apply status filter if provided
    if (status !== undefined) {
      queryBuilder.andWhere('stencil.status = :status', { status });
    }
    
    // Apply hidden filter - only include hidden stencils if explicitly requested
    if (!includeHidden) {
      queryBuilder.andWhere('stencil.isHidden = :isHidden', { isHidden: false });
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
      limit = 10,
      status
    } = params;

    // Crear query builder base
    const queryBuilder = this.stencilRepository
      .createQueryBuilder('stencil')
      .leftJoinAndSelect('stencil.tags', 'tags')
      .leftJoinAndSelect('stencil.artist', 'artist')
      .where('stencil.deletedAt IS NULL');

    // Apply status filter if provided
    if (status !== undefined) {
      queryBuilder.andWhere('stencil.status = :status', { status });
    }

    // Apply hidden filter - only include hidden stencils if explicitly requested
    if (!includeHidden) {
      queryBuilder.andWhere('stencil.isHidden = :isHidden', { isHidden: false });
    }

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