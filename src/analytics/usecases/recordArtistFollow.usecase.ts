import { Injectable } from '@nestjs/common';
import { AnalyticsProvider } from '../infrastructure/database/analytics.provider';

@Injectable()
export class RecordArtistFollowUseCase {
  constructor(private readonly analyticsProvider: AnalyticsProvider) {}

  async execute(artistId: number, fromContentView: boolean = false): Promise<void> {
    await this.analyticsProvider.recordArtistFollow(
      artistId,
      fromContentView
    );
  }
} 