import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TattooDesignCacheEntity } from '../entities/tattoo-design-cache.entity';
import { TATTOO_TRANSLATION_DB_CONNECTION_NAME } from '../../../../databases/constants';

// Define an interface for the similarity search results
export interface DesignWithSimilarity extends TattooDesignCacheEntity {
  similarity: number;
}

@Injectable()
export class TattooDesignCacheRepository {
  private readonly logger = new Logger(TattooDesignCacheRepository.name);

  constructor(
    @InjectRepository(TattooDesignCacheEntity, TATTOO_TRANSLATION_DB_CONNECTION_NAME)
    private readonly repository: Repository<TattooDesignCacheEntity>,
  ) {}

  /**
   * Convert snake_case database results to camelCase entity format
   */
  private convertToCamelCase(record: any): TattooDesignCacheEntity {
    if (!record) return null;
    
    return {
      id: record.id,
      userQuery: record.user_query,
      style: record.style,
      imageUrls: record.image_urls,
      prompt: record.prompt,
      metadata: record.metadata,
      searchVector: record.search_vector,
      usageCount: record.usage_count,
      isFavorite: record.is_favorite,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    };
  }
  
  /**
   * Convert snake_case similarity results to camelCase with similarity property
   */
  private convertSimilarityResult(record: any): DesignWithSimilarity {
    if (!record) return null;
    
    return {
      ...this.convertToCamelCase(record),
      similarity: record.similarity
    };
  }

  async save(entity: Partial<TattooDesignCacheEntity>): Promise<TattooDesignCacheEntity> {
    try {
      this.logger.log('Saving design using native query');
      
      // Convert array to PostgreSQL array syntax
      const imageUrlsString = `{${entity.imageUrls?.map(url => `"${url.replace(/"/g, '\\"')}"`).join(',') || ''}}`;
      
      // Generate a UUID for the new entity
      const newId = await this.repository.query(`SELECT gen_random_uuid() as id`);
      const id = newId[0]?.id;
      
      // Save the entity using a raw SQL query
      const query = `
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
          $1,
          $2,
          $3,
          $4::text[],
          $5,
          $6::jsonb,
          $7,
          $8
        ) RETURNING *;
      `;
      
      const result = await this.repository.query(query, [
        id,
        entity.userQuery,
        entity.style,
        imageUrlsString,
        entity.prompt,
        entity.metadata ? JSON.stringify(entity.metadata) : null,
        entity.usageCount || 1,
        entity.isFavorite || false
      ]);
      
      // Update the search vector
      if (result?.[0]?.id) {
        await this.updateSearchVector(result[0].id);
      }
      
      // Convert from snake_case to camelCase
      return this.convertToCamelCase(result[0]);
    } catch (error: any) {
      this.logger.error(`Error saving tattoo design: ${error.message || 'Unknown error'}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<TattooDesignCacheEntity | null> {
    try {
      const result = await this.repository.query(
        `SELECT * FROM tattoo_design_cache WHERE id = $1`,
        [id]
      );
      
      return result.length > 0 ? this.convertToCamelCase(result[0]) : null;
    } catch (error: any) {
      this.logger.error(`Error finding design by ID: ${error.message || 'Unknown error'}`);
      return null;
    }
  }

  async incrementUsageCount(id: string): Promise<void> {
    await this.repository.query(`
      UPDATE tattoo_design_cache 
      SET usage_count = usage_count + 1 
      WHERE id = $1
    `, [id]);
  }

  async setFavorite(id: string, isFavorite: boolean): Promise<void> {
    await this.repository.query(`
      UPDATE tattoo_design_cache 
      SET is_favorite = $2 
      WHERE id = $1
    `, [id, isFavorite]);
  }

  async updateSearchVector(id: string): Promise<void> {
    try {
      await this.repository.query(`
        UPDATE tattoo_design_cache
        SET search_vector = 
          setweight(to_tsvector('english', COALESCE(user_query, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(style, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(prompt, '')), 'C')
        WHERE id = $1
      `, [id]);
    } catch (error: any) {
      this.logger.error(`Error updating search vector: ${error.message || 'Unknown error'}`);
    }
  }

  async findSimilarByText(
    query: string, 
    style?: string,
    limit: number = 5, 
    similarityThreshold: number = 0.3
  ): Promise<DesignWithSimilarity[]> {
    try {
      const styleClause = style ? 'AND style ILIKE $3' : '';
      const styleParam = style ? `%${style}%` : null;
      
      const sqlQuery = `
        SELECT *, 
               similarity(user_query, $1) as similarity
        FROM tattoo_design_cache
        WHERE similarity(user_query, $1) > $2
        ${styleClause}
        ORDER BY similarity DESC, usage_count DESC, is_favorite DESC
        LIMIT $${style ? '4' : '3'}
      `;

      const params = style 
        ? [query, similarityThreshold, styleParam, limit] 
        : [query, similarityThreshold, limit];

      const results = await this.repository.query(sqlQuery, params);
      
      // Convert all results from snake_case to camelCase with similarity
      return results.map(result => this.convertSimilarityResult(result));
    } catch (error: any) {
      this.logger.error(`Error finding similar designs by text: ${error.message || 'Unknown error'}`);
      return [];
    }
  }

  async findByKeywords(keywords: string[], limit: number = 10): Promise<TattooDesignCacheEntity[]> {
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
        SELECT *
        FROM tattoo_design_cache
        WHERE search_vector @@ to_tsquery('english', $1)
        ORDER BY usage_count DESC, is_favorite DESC, created_at DESC
        LIMIT $2
      `;

      const results = await this.repository.query(sqlQuery, [formattedKeywords, limit]);
      
      // Convert all results from snake_case to camelCase
      return results.map(result => this.convertToCamelCase(result));
    } catch (error: any) {
      this.logger.error(`Error finding designs by keywords: ${error.message || 'Unknown error'}`);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.query(`DELETE FROM tattoo_design_cache WHERE id = $1`, [id]);
  }

  async executeRawQuery<T>(query: string, parameters: any[] = []): Promise<T[]> {
    try {
      const results = await this.repository.query(query, parameters);
      
      // Since this is a generic method, we can't automatically convert to camelCase
      // The caller will need to handle the conversion if needed
      return results;
    } catch (error: any) {
      this.logger.error(`Error executing raw query: ${error.message || 'Unknown error'}`);
      return [];
    }
  }
} 