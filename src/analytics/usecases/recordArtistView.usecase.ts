import { Injectable } from '@nestjs/common';
import { AnalyticsProvider } from '../infrastructure/database/analytics.provider';
import { RecordArtistViewDto } from '../domain/dtos/metrics.dto';

@Injectable()
export class RecordArtistViewUseCase {
  constructor(private readonly analyticsProvider: AnalyticsProvider) {}

  async execute(userId: number, dto: RecordArtistViewDto): Promise<void> {
    await this.analyticsProvider.incrementArtistView(
      dto.artistId,
      userId
    );
  }
} 