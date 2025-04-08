import { Injectable } from '@nestjs/common';
import { GetContentSummaryMetricsUseCase } from '../../usecases/getContentSummaryMetrics.usecase';
import { ContentType } from '../../domain/enums/content-types.enum';
import { IContentSummaryMetrics } from '../../domain/interfaces/content-summary-metrics.interface';
import { AnalyticsRepository } from '../database/repositories/analytics.repository';

export interface WithMetrics {
  metrics: IContentSummaryMetrics;
}

export interface MetricsOptions {
  disableCache?: boolean;
}

@Injectable()
export class ContentMetricsEnricherService {
  constructor(
    private readonly getContentSummaryMetricsUseCase: GetContentSummaryMetricsUseCase,
    private readonly analyticsProvider: AnalyticsRepository,
  ) {}

  /**
   * Enriches a single content item with metrics
   */
  async enrichWithMetrics<T extends { id: string }>(
    content: T,
    contentType: ContentType,
    userId?: string,
    options?: MetricsOptions,
  ): Promise<T & WithMetrics> {
    if (!content) {
      return null;
    }

    const metrics = await this.getContentSummaryMetricsUseCase.execute(
      content.id,
      contentType,
      options?.disableCache,
    );

    // Add user-specific information if userId is provided
    if (userId) {
      metrics.userHasLiked = await this.analyticsProvider.checkUserHasLiked(
        content.id,
        contentType,
        userId,
      );
    }

    return {
      ...content,
      metrics,
    };
  }

  /**
   * Enriches an array of content items with metrics
   */
  async enrichAllWithMetrics<T extends { id: string }>(
    contents: T[],
    contentType: ContentType,
    userId?: string,
    options?: MetricsOptions,
  ): Promise<(T & WithMetrics)[]> {
    if (!contents?.length) {
      return [];
    }

    const contentIds = contents.map(content => content.id);
    const metricsMap = await this.getContentSummaryMetricsUseCase.executeBatch(
      contentIds,
      contentType,
      options?.disableCache,
    );

    // For user-specific likes, we need to check each content item
    let userLikesMap: Map<string, boolean> = new Map();
    
    if (userId) {
      // We'll make parallel calls to check likes for performance
      const likeChecks = contents.map(content => 
        this.analyticsProvider.checkUserHasLiked(content.id, contentType, userId)
          .then(hasLiked => [content.id, hasLiked])
      );
      
      const likeResults = await Promise.all(likeChecks);
      userLikesMap = new Map(likeResults as [string, boolean][]);
    }

    return contents.map(content => {
      const baseMetrics = metricsMap.get(content.id) || {
        viewCount: 0,
        likeCount: 0,
      };
      
      // Add userHasLiked if userId was provided
      if (userId) {
        baseMetrics.userHasLiked = userLikesMap.get(content.id) || false;
      }
      
      return {
        ...content,
        metrics: baseMetrics,
      };
    });
  }

  /**
   * Enriches a paginated response with metrics
   */
  async enrichPaginatedWithMetrics<T extends { id: string }>(
    paginatedResponse: {
      items: T[];
      page: number;
      limit: number;
      total: number;
      pages: number;
    },
    contentType: ContentType,
    userId?: string,
    options?: MetricsOptions,
  ): Promise<{
    items: (T & WithMetrics)[];
    page: number;
    limit: number;
    total: number;
    pages: number;
  }> {
    if (!paginatedResponse?.items?.length) {
      return {
        ...paginatedResponse,
        items: [],
      };
    }

    const enrichedItems = await this.enrichAllWithMetrics(
      paginatedResponse.items,
      contentType,
      userId,
      options,
    );

    return {
      ...paginatedResponse,
      items: enrichedItems,
    };
  }

  /**
   * Adds empty metrics to content items (useful for objects that haven't been stored yet)
   */
  addEmptyMetrics<T>(content: T, userHasLiked?: boolean): T & WithMetrics {
    return {
      ...content,
      metrics: {
        viewCount: 0,
        likeCount: 0,
        userHasLiked,
      },
    };
  }

  /**
   * Adds empty metrics to an array of content items
   */
  addEmptyMetricsToAll<T>(contents: T[], userHasLiked?: boolean): (T & WithMetrics)[] {
    if (!contents?.length) {
      return [];
    }

    return contents.map(content => this.addEmptyMetrics(content, userHasLiked));
  }
} 