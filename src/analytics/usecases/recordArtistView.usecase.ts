import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../infrastructure/database/repositories/analytics.repository';
import { RecordArtistViewDto } from '../domain/dtos/metrics.dto';

@Injectable()
export class RecordArtistViewUseCase {
  constructor(private readonly analyticsProvider: AnalyticsRepository) {}

  async execute(userId: string, dto: RecordArtistViewDto): Promise<void> {
    await this.analyticsProvider.incrementArtistView(
      dto.artistId,
      userId
    );
  }
} 