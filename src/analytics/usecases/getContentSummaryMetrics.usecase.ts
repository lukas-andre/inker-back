import { Injectable } from '@nestjs/common';
import { AnalyticsProvider } from '../infrastructure/database/analytics.provider';
import { ContentType } from '../domain/enums/content-types.enum';
import { IContentSummaryMetrics } from '../domain/interfaces/content-summary-metrics.interface';

@Injectable()
export class GetContentSummaryMetricsUseCase {
  constructor(private readonly analyticsProvider: AnalyticsProvider) {}

  async execute(contentId: number, contentType: ContentType, disableCache?: boolean): Promise<IContentSummaryMetrics> {
    return this.analyticsProvider.getSummaryMetricsForContent(contentId, contentType, disableCache);
  }

  async executeBatch(contentIds: number[], contentType: ContentType, disableCache?: boolean): Promise<Map<number, IContentSummaryMetrics>> {
    return this.analyticsProvider.getBatchSummaryMetrics(contentIds, contentType, disableCache);
  }
} 