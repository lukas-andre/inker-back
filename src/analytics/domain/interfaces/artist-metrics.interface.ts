import { IViewMetrics } from './content-metrics.interface';

export interface IFollowerMetrics {
  count: number;
  fromContentViews?: number;
  conversionRate?: number;
}

export interface IArtistMetrics {
  artistId: string;
  metrics: {
    views: IViewMetrics;
    followers?: IFollowerMetrics;
  };
}
