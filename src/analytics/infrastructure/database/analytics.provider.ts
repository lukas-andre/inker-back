import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ContentMetrics } from '../entities/content-metrics.entity';
import { ArtistMetrics } from '../entities/artist-metrics.entity';
import { ContentMetricsViewer } from '../entities/content-metrics-viewer.entity';
import { ArtistMetricsViewer } from '../entities/artist-metrics-viewer.entity';
import { ContentType } from '../../domain/enums/content-types.enum';
import { InteractionType, ViewSource } from '../../domain/enums/interaction-types.enum';
import { ANALYTICS_DB_CONNECTION_NAME } from '../../../databases/constants';
import { IContentSummaryMetrics } from '../../domain/interfaces/content-summary-metrics.interface';
import { AnalyticsInteractionResponseDto } from '../../domain/dtos/analytics-interaction-response.dto';

interface ToggleReactionResponse {
  result: boolean;
  isLiked: boolean;
  metrics: {
    count: number;
    userIds: number[];
  };
}

@Injectable()
export class AnalyticsProvider extends BaseComponent {
  constructor(
    @InjectRepository(ContentMetrics, ANALYTICS_DB_CONNECTION_NAME)
    private readonly contentMetricsRepository: Repository<ContentMetrics>,
    
    @InjectRepository(ArtistMetrics, ANALYTICS_DB_CONNECTION_NAME)
    private readonly artistMetricsRepository: Repository<ArtistMetrics>,

    @InjectRepository(ContentMetricsViewer, ANALYTICS_DB_CONNECTION_NAME)
    private readonly contentMetricsViewerRepository: Repository<ContentMetricsViewer>,
    
    @InjectRepository(ArtistMetricsViewer, ANALYTICS_DB_CONNECTION_NAME)
    private readonly artistMetricsViewerRepository: Repository<ArtistMetricsViewer>,
  ) {
    super(AnalyticsProvider.name);
  }

  async findContentMetrics(contentId: number, contentType: ContentType): Promise<ContentMetrics | null> {
    return this.contentMetricsRepository.findOne({
      where: { contentId, contentType },
    });
  }

  async findMultipleContentMetrics(contentIds: number[], contentType: ContentType): Promise<ContentMetrics[]> {
    return this.contentMetricsRepository.find({
      where: contentIds.map(id => ({ contentId: id, contentType })),
    });
  }

  async findArtistMetrics(artistId: number): Promise<ArtistMetrics | null> {
    return this.artistMetricsRepository.findOne({
      where: { artistId },
    });
  }

  async upsertContentMetrics(contentId: number, contentType: ContentType): Promise<ContentMetrics> {
    const existing = await this.findContentMetrics(contentId, contentType);
    
    if (existing) {
      return existing;
    }
    
    const metrics = this.contentMetricsRepository.create({
      contentId,
      contentType,
      metrics: {
        views: {
          count: 0,
          uniqueCount: 0,
        }
      }
    });
    
    return this.contentMetricsRepository.save(metrics);
  }

  async upsertArtistMetrics(artistId: number): Promise<ArtistMetrics> {
    const existing = await this.findArtistMetrics(artistId);
    
    if (existing) {
      return existing;
    }
    
    const metrics = this.artistMetricsRepository.create({
      artistId,
      metrics: {
        views: {
          count: 0,
          uniqueCount: 0,
        }
      }
    });
    
    return this.artistMetricsRepository.save(metrics);
  }

  async incrementContentView(contentId: number, contentType: ContentType, userId: number, viewSource?: ViewSource): Promise<AnalyticsInteractionResponseDto> {
    const metrics = await this.upsertContentMetrics(contentId, contentType);

    // Increment total views count
    await this.contentMetricsRepository.query(
      `UPDATE content_metrics 
       SET metrics = jsonb_set(
         jsonb_set(
           metrics, 
           '{views,count}', 
           (COALESCE((metrics->'views'->>'count')::int, 0) + 1)::text::jsonb
         ),
         '{viewSources,${viewSource || 'direct'}}',
         (COALESCE((metrics->'viewSources'->>'${viewSource || 'direct'}')::int, 0) + 1)::text::jsonb
       )
       WHERE id = $1`,
      [metrics.id]
    );

    // Check if this is a unique view for this user
    const viewerKey = `viewer_${userId}`;
    const existingViewer = await this.contentMetricsViewerRepository.findOne({
      where: { metricsId: metrics.id, viewerKey }
    });

    // If it's a unique view, increment unique count and save viewer
    if (!existingViewer) {
      await this.contentMetricsViewerRepository.save({
        metricsId: metrics.id,
        viewerKey
      });

      await this.contentMetricsRepository.query(
        `UPDATE content_metrics 
         SET metrics = jsonb_set(
           metrics, 
           '{views,uniqueCount}', 
           (COALESCE((metrics->'views'->>'uniqueCount')::int, 0) + 1)::text::jsonb
         )
         WHERE id = $1`,
        [metrics.id]
      );
    }

    // Get updated metrics
    const updatedMetrics = await this.findContentMetrics(contentId, contentType);
    
    return {
      result: true,
      state: {
        count: updatedMetrics?.metrics.views?.count || 0,
        userIds: [userId]
      },
      metrics: {
        viewCount: updatedMetrics?.metrics.views?.count || 0,
        uniqueViewCount: updatedMetrics?.metrics.views?.uniqueCount || 0,
        engagementRate: updatedMetrics?.metrics.engagementRate || 0
      }
    };
  }

  async incrementArtistView(artistId: number, userId: number): Promise<void> {
    const metrics = await this.upsertArtistMetrics(artistId);

    // Increment total views count
    await this.artistMetricsRepository.query(
      `UPDATE artist_metrics 
       SET metrics = jsonb_set(
         metrics, 
         '{views,count}', 
         (COALESCE((metrics->'views'->>'count')::int, 0) + 1)::text::jsonb
       )
       WHERE id = $1`,
      [metrics.id]
    );

    // Check if this is a unique view for this user
    const viewerKey = `viewer_${userId}`;
    const existingViewer = await this.artistMetricsViewerRepository.findOne({
      where: { metricsId: metrics.id, viewerKey }
    });

    // If it's a unique view, increment unique count and save viewer
    if (!existingViewer) {
      await this.artistMetricsViewerRepository.save({
        metricsId: metrics.id,
        viewerKey
      });

      await this.artistMetricsRepository.query(
        `UPDATE artist_metrics 
         SET metrics = jsonb_set(
           metrics, 
           '{views,uniqueCount}', 
           (COALESCE((metrics->'views'->>'uniqueCount')::int, 0) + 1)::text::jsonb
         )
         WHERE id = $1`,
        [metrics.id]
      );
    }
  }

  async toggleContentReaction(contentId: number, contentType: ContentType, userId: number): Promise<AnalyticsInteractionResponseDto> {
    const metrics = await this.upsertContentMetrics(contentId, contentType);
    
    // Initialize reactions if they don't exist
    if (!metrics.metrics.reactions || !metrics.metrics.reactions.like) {
      await this.contentMetricsRepository.query(
        `UPDATE content_metrics 
         SET metrics = jsonb_set(
           metrics, 
           '{reactions}', 
           '{"like":{"count":0,"userIds":[]}}'::jsonb
         )
         WHERE id = $1`,
        [metrics.id]
      );
    }

    // Check if user has already reacted
    const hasReacted = await this.contentMetricsRepository.query(
      `SELECT (metrics->'reactions'->'like'->'userIds') @> $1::jsonb as has_reacted
       FROM content_metrics
       WHERE id = $2`,
      [JSON.stringify([userId]), metrics.id]
    );

    let isLiked: boolean;

    if (hasReacted[0].has_reacted) {
      // User has already reacted, remove the reaction
      await this.contentMetricsRepository.query(
        `UPDATE content_metrics 
         SET metrics = jsonb_set(
           jsonb_set(
             metrics, 
             '{reactions,like,count}', 
             (COALESCE((metrics->'reactions'->'like'->>'count')::int, 0) - 1)::text::jsonb
           ),
           '{reactions,like,userIds}', 
           COALESCE(
             (
               SELECT jsonb_agg(u) 
               FROM jsonb_array_elements((metrics->'reactions'->'like'->'userIds')) as u 
               WHERE u::text != $1::text
             ),
             '[]'::jsonb
           )
         )
         WHERE id = $2`,
        [userId.toString(), metrics.id]
      );
      isLiked = false;
    } else {
      // User has not reacted, add the reaction
      await this.contentMetricsRepository.query(
        `UPDATE content_metrics 
         SET metrics = jsonb_set(
           jsonb_set(
             metrics, 
             '{reactions,like,count}', 
             (COALESCE((metrics->'reactions'->'like'->>'count')::int, 0) + 1)::text::jsonb
           ),
           '{reactions,like,userIds}', 
           (COALESCE(metrics->'reactions'->'like'->'userIds', '[]'::jsonb) || $1::jsonb)
         )
         WHERE id = $2`,
        [JSON.stringify([userId]), metrics.id]
      );
      isLiked = true;
    }

    // Update engagement rate
    await this.updateContentEngagementRate(metrics.id);
    
    // Get updated metrics
    const updatedMetrics = await this.findContentMetrics(contentId, contentType);
    
    return {
      result: true,
      state: {
        count: updatedMetrics?.metrics.reactions?.like?.count || 0,
        userIds: updatedMetrics?.metrics.reactions?.like?.userIds || []
      },
      metrics: {
        viewCount: updatedMetrics?.metrics.views?.count || 0,
        uniqueViewCount: updatedMetrics?.metrics.views?.uniqueCount || 0,
        engagementRate: updatedMetrics?.metrics.engagementRate || 0
      }
    };
  }

  async recordViewDuration(contentId: number, contentType: ContentType, durationSeconds: number): Promise<AnalyticsInteractionResponseDto> {
    const metrics = await this.upsertContentMetrics(contentId, contentType);
    
    // Initialize view duration if it doesn't exist
    if (!metrics.metrics.viewDuration) {
      await this.contentMetricsRepository.query(
        `UPDATE content_metrics 
         SET metrics = jsonb_set(
           metrics, 
           '{viewDuration}', 
           '{"totalSeconds":0,"averageSeconds":0}'::jsonb
         )
         WHERE id = $1`,
        [metrics.id]
      );
    }
    
    // Update totalSeconds and averageSeconds
    await this.contentMetricsRepository.query(
      `UPDATE content_metrics 
       SET metrics = jsonb_set(
         jsonb_set(
           metrics, 
           '{viewDuration,totalSeconds}', 
           (COALESCE((metrics->'viewDuration'->>'totalSeconds')::int, 0) + $1)::text::jsonb
         ),
         '{viewDuration,averageSeconds}', 
         (
           (COALESCE((metrics->'viewDuration'->>'totalSeconds')::int, 0) + $1) / 
           NULLIF(COALESCE((metrics->'views'->>'count')::int, 0), 0)
         )::text::jsonb
       )
       WHERE id = $2`,
      [durationSeconds, metrics.id]
    );
    
    // Update engagement rate
    await this.updateContentEngagementRate(metrics.id);

    // Get updated metrics
    const updatedMetrics = await this.findContentMetrics(contentId, contentType);
    
    return {
      result: true,
      state: {
        count: updatedMetrics?.metrics.viewDuration?.totalSeconds || 0,
        userIds: []
      },
      metrics: {
        viewCount: updatedMetrics?.metrics.views?.count || 0,
        uniqueViewCount: updatedMetrics?.metrics.views?.uniqueCount || 0,
        engagementRate: updatedMetrics?.metrics.engagementRate || 0
      }
    };
  }

  async recordConversion(contentId: number, contentType: ContentType): Promise<AnalyticsInteractionResponseDto> {
    const metrics = await this.upsertContentMetrics(contentId, contentType);
    
    // Initialize conversions if they don't exist
    if (!metrics.metrics.conversions) {
      await this.contentMetricsRepository.query(
        `UPDATE content_metrics 
         SET metrics = jsonb_set(
           metrics, 
           '{conversions}', 
           '{"count":0,"conversionRate":0}'::jsonb
         )
         WHERE id = $1`,
        [metrics.id]
      );
    }
    
    // Update count and conversionRate
    await this.contentMetricsRepository.query(
      `UPDATE content_metrics 
       SET metrics = jsonb_set(
         jsonb_set(
           metrics, 
           '{conversions,count}', 
           (COALESCE((metrics->'conversions'->>'count')::int, 0) + 1)::text::jsonb
         ),
         '{conversions,conversionRate}', 
         (
           (COALESCE((metrics->'conversions'->>'count')::int, 0) + 1) * 100.0 / 
           NULLIF(COALESCE((metrics->'views'->>'count')::int, 0), 0)
         )::text::jsonb
       )
       WHERE id = $1`,
      [metrics.id]
    );

    // Get updated metrics
    const updatedMetrics = await this.findContentMetrics(contentId, contentType);
    
    return {
      result: true,
      state: {
        count: updatedMetrics?.metrics.conversions?.count || 0,
        userIds: []
      },
      metrics: {
        viewCount: updatedMetrics?.metrics.views?.count || 0,
        uniqueViewCount: updatedMetrics?.metrics.views?.uniqueCount || 0,
        engagementRate: updatedMetrics?.metrics.engagementRate || 0
      }
    };
  }

  async recordImpression(contentId: number, contentType: ContentType): Promise<AnalyticsInteractionResponseDto> {
    const metrics = await this.upsertContentMetrics(contentId, contentType);
    
    // Initialize impressions if they don't exist
    if (!metrics.metrics.impressions) {
      await this.contentMetricsRepository.query(
        `UPDATE content_metrics 
         SET metrics = jsonb_set(
           metrics, 
           '{impressions}', 
           '{"count":0,"ctr":0}'::jsonb
         )
         WHERE id = $1`,
        [metrics.id]
      );
    }
    
    // Update count and CTR
    await this.contentMetricsRepository.query(
      `UPDATE content_metrics 
       SET metrics = jsonb_set(
         jsonb_set(
           metrics, 
           '{impressions,count}', 
           (COALESCE((metrics->'impressions'->>'count')::int, 0) + 1)::text::jsonb
         ),
         '{impressions,ctr}', 
         (
           COALESCE((metrics->'views'->>'count')::int, 0) * 100.0 / 
           NULLIF((COALESCE((metrics->'impressions'->>'count')::int, 0) + 1), 0)
         )::text::jsonb
       )
       WHERE id = $1`,
      [metrics.id]
    );

    // Get updated metrics
    const updatedMetrics = await this.findContentMetrics(contentId, contentType);
    
    return {
      result: true,
      state: {
        count: updatedMetrics?.metrics.impressions?.count || 0,
        userIds: []
      },
      metrics: {
        viewCount: updatedMetrics?.metrics.views?.count || 0,
        uniqueViewCount: updatedMetrics?.metrics.views?.uniqueCount || 0,
        engagementRate: updatedMetrics?.metrics.engagementRate || 0
      }
    };
  }

  async recordArtistFollow(artistId: number, fromContentView: boolean = false): Promise<AnalyticsInteractionResponseDto> {
    const metrics = await this.upsertArtistMetrics(artistId);
    
    // Initialize followers if they don't exist
    if (!metrics.metrics.followers) {
      await this.artistMetricsRepository.query(
        `UPDATE artist_metrics 
         SET metrics = jsonb_set(
           metrics, 
           '{followers}', 
           '{"count":0,"fromContentViews":0,"conversionRate":0}'::jsonb
         )
         WHERE id = $1`,
        [metrics.id]
      );
    }
    
    // Update follower metrics
    const fromContentViewsIncrement = fromContentView ? 1 : 0;
    
    await this.artistMetricsRepository.query(
      `UPDATE artist_metrics 
       SET metrics = jsonb_set(
         jsonb_set(
           jsonb_set(
             metrics, 
             '{followers,count}', 
             (COALESCE((metrics->'followers'->>'count')::int, 0) + 1)::text::jsonb
           ),
           '{followers,fromContentViews}', 
           (COALESCE((metrics->'followers'->>'fromContentViews')::int, 0) + $1)::text::jsonb
         ),
         '{followers,conversionRate}', 
         (
           COALESCE((metrics->'followers'->>'fromContentViews')::int, 0) + $1) * 100.0 / 
           NULLIF(COALESCE((metrics->'views'->>'count')::int, 0), 0)
         )::text::jsonb
       )
       WHERE id = $2`,
      [fromContentViewsIncrement, metrics.id]
    );

    // Get updated metrics
    const updatedMetrics = await this.findArtistMetrics(artistId);
    
    return {
      result: true,
      state: {
        count: updatedMetrics?.metrics.followers?.count || 0,
        userIds: []
      },
      metrics: {
        viewCount: updatedMetrics?.metrics.views?.count || 0,
        uniqueViewCount: updatedMetrics?.metrics.views?.uniqueCount || 0,
      }
    };
  }

  private async updateContentEngagementRate(metricsId: number): Promise<void> {
    await this.contentMetricsRepository.query(
      `UPDATE content_metrics 
       SET metrics = jsonb_set(
         metrics, 
         '{engagementRate}', 
         (
           (
             COALESCE((metrics->'reactions'->'like'->>'count')::int, 0) + 
             COALESCE((metrics->'conversions'->>'count')::int, 0)
           ) * 100.0 / 
           NULLIF(COALESCE((metrics->'views'->>'count')::int, 0), 0)
         )::text::jsonb
       )
       WHERE id = $1`,
      [metricsId]
    );
  }

  async checkUserHasLiked(contentId: number, contentType: ContentType, userId: number): Promise<boolean> {
    const metrics = await this.findContentMetrics(contentId, contentType);
    
    if (!metrics || !metrics.metrics.reactions || !metrics.metrics.reactions.like) {
      return false;
    }
    
    return metrics.metrics.reactions.like.userIds.includes(userId);
  }

  async getSummaryMetricsForContent(contentId: number, contentType: ContentType, disableCache?: boolean): Promise<IContentSummaryMetrics> {
    const cacheOptions = disableCache ? undefined : {
      id: `content_metrics_summary_${contentType}_${contentId}`,
      milliseconds: 60000 // 1 minute cache
    };

    const metrics = await this.contentMetricsRepository.findOne({
      where: { contentId, contentType },
      cache: cacheOptions
    });
    
    if (!metrics) {
      return {
        viewCount: 0,
        likeCount: 0
      };
    }
    
    return {
      viewCount: metrics.metrics.views?.count || 0,
      likeCount: metrics.metrics.reactions?.like?.count || 0
    };
  }
  
  async getBatchSummaryMetrics(contentIds: number[], contentType: ContentType, disableCache?: boolean): Promise<Map<number, IContentSummaryMetrics>> {
    if (contentIds.length === 0) {
      return new Map();
    }
    
    const cacheOptions = disableCache ? undefined : {
      id: `content_metrics_batch_${contentType}_${contentIds.join('_')}`,
      milliseconds: 60000 // 1 minute cache
    };
    
    const metrics = await this.contentMetricsRepository.find({
      where: contentIds.map(id => ({ contentId: id, contentType })),
      cache: cacheOptions
    });
    
    // Create a map of contentId -> metrics
    const metricsMap = new Map<number, IContentSummaryMetrics>();
    
    // Initialize with default values for all requested IDs
    contentIds.forEach(id => {
      metricsMap.set(id, {
        viewCount: 0,
        likeCount: 0
      });
    });
    
    // Update with actual metrics for items that have them
    metrics.forEach(metric => {
      metricsMap.set(metric.contentId, {
        viewCount: metric.metrics.views?.count || 0,
        likeCount: metric.metrics.reactions?.like?.count || 0
      });
    });
    
    return metricsMap;
  }
} 