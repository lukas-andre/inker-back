import { Injectable } from '@nestjs/common';
import { AnalyticsProvider } from '../infrastructure/database/analytics.provider';
import { ContentType } from '../domain/enums/content-types.enum';

@Injectable()
export class GetContentSummaryMetricsUseCase {
  constructor(private readonly analyticsProvider: AnalyticsProvider) {}

  async execute(contentId: number, contentType: ContentType): Promise<{viewCount: number, likeCount: number}> {
    return this.analyticsProvider.getSummaryMetricsForContent(contentId, contentType);
  }

  async executeBatch(contentIds: number[], contentType: ContentType): Promise<Map<number, {viewCount: number, likeCount: number}>> {
    return this.analyticsProvider.getBatchSummaryMetrics(contentIds, contentType);
  }
} 