import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../infrastructure/database/repositories/analytics.repository';
import { ContentType } from '../domain/enums/content-types.enum';
import { IContentSummaryMetrics } from '../domain/interfaces/content-summary-metrics.interface';

@Injectable()
export class GetContentSummaryMetricsUseCase {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(contentId: string, contentType: ContentType, disableCache?: boolean): Promise<IContentSummaryMetrics> {
    return this.analyticsRepository.getSummaryMetricsForContent(contentId, contentType, disableCache);
  }

  async executeBatch(contentIds: string[], contentType: ContentType, disableCache?: boolean): Promise<Map<string, IContentSummaryMetrics>> {
    return this.analyticsRepository.getBatchSummaryMetrics(contentIds, contentType, disableCache);
  }
} 