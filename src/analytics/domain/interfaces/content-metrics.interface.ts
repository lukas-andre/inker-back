import { ContentType } from '../enums/content-types.enum';
import { ViewSource } from '../enums/interaction-types.enum';

export interface IReactionMetrics {
  count: number;
  userIds: number[];
}

export interface IViewMetrics {
  count: number;
  uniqueCount: number;
}

export interface IViewDurationMetrics {
  totalSeconds: number;
  averageSeconds: number;
}

export interface IConversionMetrics {
  count: number;
  conversionRate: number;
}

export interface IImpressionMetrics {
  count: number;
  ctr: number; // Click-through rate (views/impressions)
}

export interface IViewSourceMetrics {
  [ViewSource.SEARCH]?: number;
  [ViewSource.FEED]?: number;
  [ViewSource.PROFILE]?: number;
  [ViewSource.RELATED]?: number;
  [ViewSource.DIRECT]?: number;
}

export interface IContentMetrics {
  contentId: number;
  contentType: ContentType;
  metrics: {
    reactions?: {
      like: IReactionMetrics;
    };
    views: IViewMetrics;
    viewDuration?: IViewDurationMetrics;
    engagementRate?: number;
    conversions?: IConversionMetrics;
    impressions?: IImpressionMetrics;
    viewSources?: IViewSourceMetrics;
  };
} 