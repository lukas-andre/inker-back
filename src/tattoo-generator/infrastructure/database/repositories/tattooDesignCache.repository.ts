import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TATTOO_TRANSLATION_DB_CONNECTION_NAME } from '../../../../databases/constants';
import { TattooDesignCacheEntity } from '../entities/tattooDesignCache.entity';

// Define an interface for the similarity search results
export interface DesignWithSimilarity extends TattooDesignCacheEntity {
  similarity: number;
}

@Injectable()
export class TattooDesignCacheRepository {
  private readonly logger = new Logger(TattooDesignCacheRepository.name);

  constructor(
    @InjectRepository(
      TattooDesignCacheEntity,
      TATTOO_TRANSLATION_DB_CONNECTION_NAME,
    )
    private readonly repository: Repository<TattooDesignCacheEntity>,
  ) {}

  async save(
    entity: Partial<TattooDesignCacheEntity>,
  ): Promise<TattooDesignCacheEntity> {
    try {
      this.logger.log(
        'Saving design using native query with JSON transformation',
      );

      // Convert array to PostgreSQL array syntax
      const imageUrlsString = `{${
        entity.imageUrls
          ?.map(url => `"${url.replace(/"/g, '\\"')}"`)
          .join(',') || ''
      }}`;

      // Save using a query that returns data in camelCase format directly
      const query = `
        WITH inserted AS (
          INSERT INTO tattoo_design_cache (
            id,
            user_query,
            style,
            image_urls,
            prompt,
            metadata,
            usage_count,
            is_favorite
          ) VALUES (
            gen_random_uuid(),
            $1,
            $2,
            $3::text[],
            $4,
            $5::jsonb,
            $6,
            $7
          ) RETURNING *
        )
        SELECT json_build_object(
          'id', inserted.id,
          'userQuery', inserted.user_query,
          'style', inserted.style,
          'imageUrls', inserted.image_urls,
          'prompt', inserted.prompt,
          'metadata', inserted.metadata,
          'searchVector', inserted.search_vector,
          'usageCount', inserted.usage_count,
          'isFavorite', inserted.is_favorite,
          'createdAt', inserted.created_at,
          'updatedAt', inserted.updated_at
        ) AS entity
        FROM inserted;
      `;

      const result = await this.repository.query(query, [
        entity.userQuery,
        entity.style,
        imageUrlsString,
        entity.prompt,
        entity.metadata ? JSON.stringify(entity.metadata) : null,
        entity.usageCount || 1,
        entity.isFavorite || false,
      ]);

      const savedEntity = result[0]?.entity as TattooDesignCacheEntity;

      // Update the search vector
      if (savedEntity?.id) {
        await this.updateSearchVector(savedEntity.id);
      }

      return savedEntity;
    } catch (error: any) {
      this.logger.error(
        `Error saving tattoo design: ${error.message || 'Unknown error'}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByImageUrl(
    imageUrl: string,
  ): Promise<TattooDesignCacheEntity | null> {
    const query = `
      SELECT * FROM tattoo_design_cache 
      WHERE image_urls @> $1;
    `;
    const result = await this.repository.query(query, [imageUrl]);
    return result.length > 0 ? result[0] : null;
  }

  async findById(id: string): Promise<TattooDesignCacheEntity | null> {
    try {
      const query = `
        SELECT json_build_object(
          'id', id,
          'userQuery', user_query,
          'style', style,
          'imageUrls', image_urls,
          'prompt', prompt,
          'metadata', metadata,
          'searchVector', search_vector,
          'usageCount', usage_count,
          'isFavorite', is_favorite,
          'createdAt', created_at,
          'updatedAt', updated_at
        ) AS entity
        FROM tattoo_design_cache 
        WHERE id = $1;
      `;

      const result = await this.repository.query(query, [id]);
      return result.length > 0 ? result[0].entity : null;
    } catch (error: any) {
      this.logger.error(
        `Error finding design by ID: ${error.message || 'Unknown error'}`,
      );
      return null;
    }
  }

  async incrementUsageCount(id: string): Promise<void> {
    await this.repository.query(
      `
      UPDATE tattoo_design_cache 
      SET usage_count = usage_count + 1 
      WHERE id = $1
    `,
      [id],
    );
  }

  async setFavorite(id: string, isFavorite: boolean): Promise<void> {
    await this.repository.query(
      `
      UPDATE tattoo_design_cache 
      SET is_favorite = $2 
      WHERE id = $1
    `,
      [id, isFavorite],
    );
  }

  async updateSearchVector(id: string): Promise<void> {
    try {
      await this.repository.query(
        `
        UPDATE tattoo_design_cache
        SET search_vector = 
          setweight(to_tsvector('english', COALESCE(user_query, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(style, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(prompt, '')), 'C')
        WHERE id = $1
      `,
        [id],
      );
    } catch (error: any) {
      this.logger.error(
        `Error updating search vector: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async findSimilarByText(
    query: string,
    style?: string,
    limit = 5,
    similarityThreshold = 0.3,
  ): Promise<DesignWithSimilarity[]> {
    try {
      const styleClause = style ? 'AND style ILIKE $3' : '';
      const styleParam = style ? `%${style}%` : null;

      const sqlQuery = `
        SELECT json_build_object(
          'id', tdc.id,
          'userQuery', tdc.user_query,
          'style', tdc.style,
          'imageUrls', tdc.image_urls,
          'prompt', tdc.prompt,
          'metadata', tdc.metadata,
          'searchVector', tdc.search_vector,
          'usageCount', tdc.usage_count,
          'isFavorite', tdc.is_favorite,
          'createdAt', tdc.created_at,
          'updatedAt', tdc.updated_at,
          'similarity', similarity(tdc.user_query, $1)
        ) AS result
        FROM tattoo_design_cache tdc
        WHERE similarity(tdc.user_query, $1) > $2
        ${styleClause}
        ORDER BY similarity(tdc.user_query, $1) DESC, tdc.usage_count DESC, tdc.is_favorite DESC
        LIMIT $${style ? '4' : '3'}
      `;

      const params = style
        ? [query, similarityThreshold, styleParam, limit]
        : [query, similarityThreshold, limit];

      const results = await this.repository.query(sqlQuery, params);

      // Extract the result objects from the query
      return results.map(item => item.result) as DesignWithSimilarity[];
    } catch (error: any) {
      this.logger.error(
        `Error finding similar designs by text: ${
          error.message || 'Unknown error'
        }`,
      );
      return [];
    }
  }

  async findByKeywords(
    keywords: string[],
    limit = 10,
  ): Promise<TattooDesignCacheEntity[]> {
    try {
      if (!keywords || keywords.length === 0) {
        return [];
      }

      const formattedKeywords = keywords
        .map(k => k.trim().replace(/['\\]/g, ''))
        .filter(k => k.length > 0)
        .map(k => k.replace(/\s+/g, ' & '))
        .join(' | ');

      if (!formattedKeywords) {
        return [];
      }

      const sqlQuery = `
        SELECT json_build_object(
          'id', id,
          'userQuery', user_query,
          'style', style,
          'imageUrls', image_urls,
          'prompt', prompt,
          'metadata', metadata,
          'searchVector', search_vector,
          'usageCount', usage_count,
          'isFavorite', is_favorite,
          'createdAt', created_at,
          'updatedAt', updated_at
        ) AS entity
        FROM tattoo_design_cache
        WHERE search_vector @@ to_tsquery('english', $1)
        ORDER BY usage_count DESC, is_favorite DESC, created_at DESC
        LIMIT $2
      `;

      const results = await this.repository.query(sqlQuery, [
        formattedKeywords,
        limit,
      ]);

      // Extract the entity objects from the query results
      return results.map(item => item.entity);
    } catch (error: any) {
      this.logger.error(
        `Error finding designs by keywords: ${
          error.message || 'Unknown error'
        }`,
      );
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.query(
      `DELETE FROM tattoo_design_cache WHERE id = $1`,
      [id],
    );
  }

  async executeRawQuery<T>(
    query: string,
    parameters: any[] = [],
  ): Promise<T[]> {
    try {
      return await this.repository.query(query, parameters);
    } catch (error: any) {
      this.logger.error(
        `Error executing raw query: ${error.message || 'Unknown error'}`,
      );
      return [];
    }
  }
}
