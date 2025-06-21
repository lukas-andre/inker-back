import { Injectable } from '@nestjs/common';

import { BaseComponent } from '../../global/domain/components/base.component';
import { RequestContext } from '../../global/infrastructure/services/requestContext.service';
import {
  UserTattooDesignDto,
  UserTattooHistoryResponseDto,
} from '../domain/dto/user-tattoo-history.dto';
import { TattooDesignCacheRepository } from '../infrastructure/database/repositories/tattooDesignCache.repository';

interface GetUserTattooHistoryParams {
  showOnlyFavorites?: boolean;
  limit?: number;
  offset?: number;
}

interface QueryResult {
  result: UserTattooHistoryResponseDto;
}

@Injectable()
export class GetUserTattooHistoryUseCase extends BaseComponent {
  constructor(
    private readonly designCacheRepository: TattooDesignCacheRepository,
  ) {
    super(GetUserTattooHistoryUseCase.name);
  }

  async execute(
    params: GetUserTattooHistoryParams,
    context: RequestContext,
  ): Promise<UserTattooHistoryResponseDto> {
    const { id: userId, userType, userTypeId } = context;
    const { showOnlyFavorites = false, limit = 20, offset = 0 } = params;

    this.logger.log(
      `Retrieving tattoo history for user: ${userId}, showOnlyFavorites: ${showOnlyFavorites}`,
    );

    try {
      // Build the query conditionally based on parameters
      const favoriteCondition = showOnlyFavorites
        ? 'AND is_favorite = true'
        : '';

      const query = `
        WITH user_designs AS (
          SELECT *
          FROM tattoo_design_cache
          WHERE metadata->>'userId' = $1
          AND metadata->>'userType' = $2
          AND metadata->>'userTypeId' = $3
          ${favoriteCondition}
          ORDER BY created_at DESC
          LIMIT $4
          OFFSET $5
        ), total_count AS (
          SELECT COUNT(*) as total
          FROM tattoo_design_cache
          WHERE metadata->>'userId' = $1
          AND metadata->>'userType' = $2
          AND metadata->>'userTypeId' = $3
          ${favoriteCondition}
        )
        SELECT 
          json_build_object(
            'designs', COALESCE(json_agg(json_build_object(
              'id', d.id,
              'userQuery', d.user_query,
              'style', d.style,
              'imageUrls', d.image_urls,
              'isFavorite', d.is_favorite,
              'metadata', d.metadata,
              'createdAt', d.created_at
            )), '[]'::json),
            'total', (SELECT total FROM total_count)
          ) AS result
        FROM user_designs d;
      `;

      const result =
        await this.designCacheRepository.executeRawQuery<QueryResult>(query, [
          userId,
          userType,
          userTypeId,
          limit,
          offset,
        ]);

      if (result.length === 0 || !result[0]?.result) {
        return { designs: [], total: 0 };
      }

      return result[0].result;
    } catch (error: any) {
      this.logger.error(
        `Error retrieving user tattoo history: ${
          error?.message || 'Unknown error'
        }`,
        error?.stack,
      );
      return { designs: [], total: 0 };
    }
  }
}
