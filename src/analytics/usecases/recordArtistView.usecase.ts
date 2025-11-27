import { Injectable } from '@nestjs/common';

import { RecordArtistViewDto } from '../domain/dtos/metrics.dto';
import { AnalyticsRepository } from '../infrastructure/database/repositories/analytics.repository';

@Injectable()
export class RecordArtistViewUseCase {
  constructor(private readonly analyticsProvider: AnalyticsRepository) {}

  async execute(userId: string, dto: RecordArtistViewDto): Promise<void> {
    await this.analyticsProvider.incrementArtistView(dto.artistId, userId);
  }
}
