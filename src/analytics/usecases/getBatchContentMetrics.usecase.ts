import { Injectable } from '@nestjs/common';
import { AnalyticsProvider } from '../infrastructure/database/analytics.provider';
import { ContentType } from '../domain/enums/content-types.enum';
import { BatchMetricsQueryDto, ContentMetricsDto } from '../domain/dtos/metrics.dto';

@Injectable()
export class GetBatchContentMetricsUseCase {
  constructor(private readonly analyticsProvider: AnalyticsProvider) {}

  async execute(dto: BatchMetricsQueryDto, userId?: number): Promise<ContentMetricsDto[]> {
    const { contentIds, contentType } = dto;

    // Get all metrics that exist
    const metricsEntities = await this.analyticsProvider.findMultipleContentMetrics(
      contentIds,
      contentType
    );

    // Create a map for quick lookups
    const metricsMap = new Map(
      metricsEntities.map(entity => [entity.contentId, entity])
    );

    // Build responses for each requested ID
    const results: ContentMetricsDto[] = [];

    for (const contentId of contentIds) {
      const entity = metricsMap.get(contentId);

      if (!entity) {
        // No metrics found, return default values
        results.push({
          contentId,
          contentType,
          viewCount: 0,
          uniqueViewCount: 0,
          likeCount: 0,
        });
        continue;
      }

      // Build response with existing metrics
      const response: ContentMetricsDto = {
        contentId: entity.contentId,
        contentType: entity.contentType,
        viewCount: entity.metrics.views.count,
        uniqueViewCount: entity.metrics.views.uniqueCount,
        likeCount: entity.metrics.reactions?.like?.count || 0,
      };

      // Add user-specific data if userId is provided
      if (userId) {
        response.userHasLiked = await this.analyticsProvider.checkUserHasLiked(
          contentId,
          contentType,
          userId
        );
      }

      // Add optional metrics if they exist
      if (entity.metrics.viewDuration) {
        response.viewDuration = entity.metrics.viewDuration;
      }

      if (entity.metrics.engagementRate !== undefined) {
        response.engagementRate = entity.metrics.engagementRate;
      }

      if (entity.metrics.conversions) {
        response.conversions = entity.metrics.conversions;
      }

      if (entity.metrics.impressions) {
        response.impressions = entity.metrics.impressions;
      }

      if (entity.metrics.viewSources) {
        response.viewSources = entity.metrics.viewSources;
      }

      results.push(response);
    }

    return results;
  }
} 