import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../infrastructure/database/repositories/analytics.repository';
import { ArtistMetricsDto } from '../domain/dtos/metrics.dto';

@Injectable()
export class GetArtistMetricsUseCase {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(artistId: string): Promise<ArtistMetricsDto> {
    const metrics = await this.analyticsRepository.findArtistMetrics(artistId);
    
    if (!metrics) {
      return {
        artistId,
        viewCount: 0,
        uniqueViewCount: 0,
      };
    }

    // Build response
    const response: ArtistMetricsDto = {
      artistId: metrics.artistId,
      viewCount: metrics.metrics.views.count,
      uniqueViewCount: metrics.metrics.views.uniqueCount,
    };

    // Add optional follower metrics if they exist
    if (metrics.metrics.followers) {
      response.followers = metrics.metrics.followers;
    }

    return response;
  }
} 