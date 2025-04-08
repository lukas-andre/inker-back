import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, FindOneOptions, FindOptionsWhere } from 'typeorm';
import { Work } from '../entities/work.entity';
import { CreateWorkDto, UpdateWorkDto } from '../../domain/dtos/work.dto';
import { Tag } from '../../../tags/tag.entity';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { TagsRepository } from '../../../tags/tags.service';
import { WorkSearchQueryDto } from '../../domain/dtos/work-search.dto';
import { WorkSource } from '../../domain/workType';

@Injectable()
export class WorkRepository extends BaseComponent {
  constructor(
    @InjectRepository(Work, 'artist-db')
    private readonly workRepository: Repository<Work>,
    private readonly tagsService: TagsRepository,
  ) {
    super(WorkRepository.name);
  }

  async findWorksByArtistId(artistId: string, includeHidden: boolean = false, source?: WorkSource): Promise<Work[]> {
    const query: FindOptionsWhere<Work> = { artistId, deletedAt: null };

    if (!includeHidden) {
      query.isHidden = false;
    }

    if (source) {
      query.source = source;
    }

    return this.workRepository.find({
      where: query,
      relations: ['tags'],
      order: { orderPosition: 'ASC', createdAt: 'DESC' },
    });
  }

  async findFeaturedWorksByArtistId(artistId: string, includeHidden: boolean = false, source?: WorkSource): Promise<Work[]> {
    const query: FindOptionsWhere<Work> = { artistId, isFeatured: true, deletedAt: null };

    if (!includeHidden) {
      query.isHidden = false;
    }

    if (source) {
      query.source = source;
    }

    return this.workRepository.find({
      where: query,
      relations: ['tags'],
      order: { orderPosition: 'ASC', createdAt: 'DESC' },
    });
  }

  async findWorkById(id: string): Promise<Work> {
    return this.workRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['tags'],
    });
  }

  async createWork(artistId: string, createWorkDto: CreateWorkDto, isFeatured: boolean = false, isHidden: boolean = false): Promise<Work> {
    const { tagIds, ...workData } = createWorkDto;

    // Using a query runner to allow for a transaction
    const queryRunner = this.workRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Use raw query to insert with tsv value computed directly
      const textSearchFields = `${workData.title || ''} ${workData.description || ''}`;
      const insertResult = await queryRunner.query(`
        INSERT INTO works (
          artist_id, title, description, image_url, image_id, image_version, 
          thumbnail_url, thumbnail_version, is_featured, order_position, 
          source, is_hidden, tsv, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 
          $7, $8, $9, $10, 
          $11, $12, to_tsvector('english', $13) || to_tsvector('spanish', $13), NOW(), NOW()
        ) RETURNING id
      `, [
        artistId,
        workData.title,
        workData.description,
        workData.imageUrl,
        workData.imageUrl?.split('/').pop() || '', // Extract imageId from URL as a fallback
        workData.imageVersion || 0,
        workData.thumbnailUrl,
        0, // Default thumbnailVersion to 0 if not provided
        isFeatured,
        workData.orderPosition || 0,
        workData.source || 'EXTERNAL', // Ensure source has a default value
        isHidden,
        textSearchFields
      ]);

      const workId = insertResult[0].id;

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        // Get the tags
        const tags = await this.tagsService.find({
          where: { id: In(Array.isArray(tagIds) ? tagIds : tagIds.split(',').map(Number)) },
        });

        // Create tag relationships using join table
        for (const tag of tags) {
          await queryRunner.query(`
            INSERT INTO work_tags (work_id, tag_id)
            VALUES ($1, $2)
          `, [workId, tag.id]);
        }
      }

      // Increment the appropriate counters
      if (isHidden) {
        // For hidden works, only increment the total counter
        await queryRunner.query(`
          UPDATE artist
          SET works_count = works_count + 1
          WHERE id = $1
        `, [artistId]);
      } else {
        // For visible works, increment both counters
        await queryRunner.query(`
          UPDATE artist
          SET works_count = works_count + 1,
              visible_works_count = visible_works_count + 1
          WHERE id = $1
        `, [artistId]);
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Return the complete work entity
      return this.findWorkById(workId);
    } catch (error) {
      // If anything fails, rollback the transaction
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating work', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async updateWork(id: string, updateWorkDto: UpdateWorkDto, isFeatured?: boolean, isHidden?: boolean): Promise<Work> {
    const { tagIds, ...workData } = updateWorkDto;

    // First, get the current work data to handle visibility changes
    const currentWork = await this.findWorkById(id);
    if (!currentWork) {
      throw new Error(`Work with id ${id} not found`);
    }

    const artistId = currentWork.artistId;
    const wasHidden = currentWork.isHidden;

    // Using a query runner to allow for a transaction
    const queryRunner = this.workRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, update the work data
      if (Object.keys(workData).length > 0 || isFeatured !== undefined || isHidden !== undefined) {
        // Build SET clause dynamically from provided data
        const updateFields = [];
        const params = [];
        let paramIndex = 1;

        // Add each field that's provided in the DTO
        for (const [key, value] of Object.entries(workData)) {
          if (value !== undefined) {
            // Convert camelCase to snake_case for column names
            const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            updateFields.push(`${columnName} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
          }
        }

        // Add featured flag if provided
        if (isFeatured !== undefined) {
          updateFields.push(`is_featured = $${paramIndex}`);
          params.push(isFeatured);
          paramIndex++;
        }

        // Add hidden flag if provided
        if (isHidden !== undefined) {
          updateFields.push(`is_hidden = $${paramIndex}`);
          params.push(isHidden);
          paramIndex++;
        }

        // Also update updated_at
        updateFields.push(`updated_at = NOW()`);

        // Execute the update only if there are fields to update
        if (updateFields.length > 0) {
          await queryRunner.query(`
            UPDATE works 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
          `, [...params, id]);
        }
      }

      // If the visibility state changed, update the appropriate counters
      if (isHidden !== undefined && wasHidden !== isHidden) {
        if (isHidden) {
          // Work changed from visible to hidden, decrement visible counter
          await queryRunner.query(`
            UPDATE artist
            SET visible_works_count = visible_works_count - 1
            WHERE id = $1 AND visible_works_count > 0
          `, [artistId]);
        } else {
          // Work changed from hidden to visible, increment visible counter
          await queryRunner.query(`
            UPDATE artist
            SET visible_works_count = visible_works_count + 1
            WHERE id = $1
          `, [artistId]);
        }
      }

      // Get the current work data to update tsv
      const workData2 = await queryRunner.query(
        `SELECT title, description FROM works WHERE id = $1`,
        [id]
      );

      // Only update tsv if title or description fields were updated or workData2 exists
      if ((workData.title || workData.description) && workData2.length > 0) {
        // Combine original fields with updates for tsv computation
        const title = workData.title || workData2[0].title || '';
        const description = workData.description || workData2[0].description || '';

        // Update the tsv field
        await queryRunner.query(`
          UPDATE works 
          SET tsv = to_tsvector('english', $1 || ' ' || $2) || to_tsvector('spanish', $1 || ' ' || $2)
          WHERE id = $3
        `, [title, description, id]);
      }

      // Update tag relationships if specified
      if (tagIds !== undefined) {
        // First, remove existing tag relationships
        await queryRunner.query(`
          DELETE FROM work_tags
          WHERE work_id = $1
        `, [id]);

        // Then add new tag relationships
        if (tagIds && tagIds.length > 0) {
          const tags = await this.tagsService.find({
            where: { id: In(Array.isArray(tagIds) ? tagIds : tagIds.split(',').map(Number)) },
          });

          for (const tag of tags) {
            await queryRunner.query(`
              INSERT INTO work_tags (work_id, tag_id)
              VALUES ($1, $2)
            `, [id, tag.id]);
          }
        }
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Return the updated work with tags
      return this.findWorkById(id);
    } catch (error) {
      // If anything fails, rollback the transaction
      await queryRunner.rollbackTransaction();
      this.logger.error('Error updating work', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async deleteWork(id: string): Promise<void> {
    const work = await this.findWorkById(id);
    if (!work) return;

    const artistId = work.artistId;
    const isHidden = work.isHidden;

    const queryRunner = this.workRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`
        UPDATE works
        SET deleted_at = NOW()
        WHERE id = $1
      `, [id]);

      if (isHidden) {
        await queryRunner.query(`
          UPDATE artist
          SET works_count = works_count - 1
          WHERE id = $1 AND works_count > 0
        `, [artistId]);
      } else {
        await queryRunner.query(`
          UPDATE artist
          SET works_count = works_count - 1,
              visible_works_count = visible_works_count - 1
          WHERE id = $1 AND works_count > 0 AND visible_works_count > 0
        `, [artistId]);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error deleting work', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async countWorksByArtistId(artistId: string): Promise<number> {
    return this.workRepository.count({
      where: { artistId, deletedAt: null },
    });
  }

  async findWorksByArtistIdWithPagination(
    artistId: string,
    page: number = 1,
    limit: number = 10,
    isFeatured?: boolean,
    source?: string,
    includeHidden: boolean = false
  ): Promise<[Work[], number]> {
    const queryBuilder = this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.tags', 'tags')
      .where('work.artistId = :artistId', { artistId })
      .andWhere('work.deletedAt IS NULL');

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('work.isFeatured = :isFeatured', { isFeatured });
    }

    if (source !== undefined) {
      queryBuilder.andWhere('work.source = :source', { source });
    }

    if (!includeHidden) {
      queryBuilder.andWhere('work.isHidden = :isHidden', { isHidden: false });
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


  async searchWorks(params: WorkSearchQueryDto): Promise<[Work[], number]> {
    const {
      query,
      tagIds,
      artistId,
      onlyFeatured,
      source,
      includeHidden = false,
      sortBy = 'relevance',
      page = 1,
      limit = 10
    } = params;

    const queryBuilder = this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.tags', 'tags')
      .leftJoinAndSelect('work.artist', 'artist')
      .where('work.deletedAt IS NULL');

    if (query && query.trim() !== '') {
      queryBuilder.andWhere(`
        work.tsv @@ plainto_tsquery('english', :query) OR
        work.tsv @@ plainto_tsquery('spanish', :query)
      `, { query });

      if (sortBy === 'relevance') {
        queryBuilder.addSelect(`
          (ts_rank(work.tsv, plainto_tsquery('english', :query), 2) * 0.6) +
          (ts_rank(work.tsv, plainto_tsquery('spanish', :query), 2) * 0.6) +
          
          (CASE WHEN work.title ILIKE :likeQuery THEN 0.4 ELSE 0 END) +
          
          (CASE 
            WHEN work.created_at > NOW() - INTERVAL '30 days' THEN 0.2
            WHEN work.created_at > NOW() - INTERVAL '90 days' THEN 0.1
            ELSE 0
          END) +
          
          (CASE WHEN work.is_featured = true THEN 0.2 ELSE 0 END)
        `, 'relevance_score');

        queryBuilder.setParameter('likeQuery', `%${query}%`);

        queryBuilder.orderBy('relevance_score', 'DESC');
      }
    }

    if (tagIds && tagIds.length > 0) {
      queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds: tagIds.split(',').map(Number) });
    }

    if (artistId) {
      queryBuilder.andWhere('work.artistId = :artistId', { artistId });
    }

    if (onlyFeatured !== undefined) {
      queryBuilder.andWhere('work.isFeatured = :onlyFeatured', { onlyFeatured });
    }

    if (source !== undefined) {
      queryBuilder.andWhere('work.source = :source', { source });
    }

    if (!includeHidden) {
      queryBuilder.andWhere('work.isHidden = :isHidden', { isHidden: false });
    }

    switch (sortBy) {
      case 'relevance':
        if (!query || query.trim() === '') {
          queryBuilder.orderBy('work.orderPosition', 'ASC')
            .addOrderBy('work.createdAt', 'DESC');
        }
        break;
      case 'newest':
        queryBuilder.orderBy('work.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('work.createdAt', 'ASC');
        break;
      case 'popularity':
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

    const offset = (page - 1) * limit;
    queryBuilder.take(limit).skip(offset);

    const [works, total] = await queryBuilder.getManyAndCount();

    return [works, total];
  }

  async findTagSuggestions(prefix: string, limit: number = 10): Promise<Tag[]> {
    const tags = await this.tagsService.find({
      where: { name: Like(`${prefix}%`) },
      take: limit,
      order: { name: 'ASC' }
    });

    return tags;
  }


  async findPopularTags(limit: number = 10): Promise<{ id: string; name: string; count: number }[]> {
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
      id: tag.id,
      name: tag.name,
      count: Number(tag.count)
    }));
  }
}