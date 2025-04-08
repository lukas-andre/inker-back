import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../infrastructure/database/repositories/analytics.repository';

@Injectable()
export class RecordArtistFollowUseCase {
  constructor(private readonly analyticsProvider: AnalyticsRepository) { }

  async execute(artistId: string, fromContentView: boolean = false): Promise<void> {
    await this.analyticsProvider.recordArtistFollow(
      artistId,
      fromContentView
    );
  }
} 