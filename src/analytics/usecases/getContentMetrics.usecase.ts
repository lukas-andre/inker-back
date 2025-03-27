import { Injectable } from '@nestjs/common';
import { AnalyticsProvider } from '../infrastructure/database/analytics.provider';
import { ContentType } from '../domain/enums/content-types.enum';
import { ContentMetricsDto } from '../domain/dtos/metrics.dto';

@Injectable()
export class GetContentMetricsUseCase {
  constructor(private readonly analyticsProvider: AnalyticsProvider) {}

  async execute(contentId: number, contentType: ContentType, userId?: number): Promise<ContentMetricsDto> {
    const metrics = await this.analyticsProvider.findContentMetrics(contentId, contentType);
    
    if (!metrics) {
      return {
        contentId,
        contentType,
        viewCount: 0,
        uniqueViewCount: 0,
        likeCount: 0,
      };
    }

    // Build response
    const response: ContentMetricsDto = {
      contentId: metrics.contentId,
      contentType: metrics.contentType,
      viewCount: metrics.metrics.views.count,
      uniqueViewCount: metrics.metrics.views.uniqueCount,
      likeCount: metrics.metrics.reactions?.like?.count || 0,
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
    if (metrics.metrics.viewDuration) {
      response.viewDuration = metrics.metrics.viewDuration;
    }

    if (metrics.metrics.engagementRate !== undefined) {
      response.engagementRate = metrics.metrics.engagementRate;
    }

    if (metrics.metrics.conversions) {
      response.conversions = metrics.metrics.conversions;
    }

    if (metrics.metrics.impressions) {
      response.impressions = metrics.metrics.impressions;
    }

    if (metrics.metrics.viewSources) {
      response.viewSources = metrics.metrics.viewSources;
    }

    return response;
  }
} 