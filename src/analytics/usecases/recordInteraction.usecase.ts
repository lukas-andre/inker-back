import { Injectable } from '@nestjs/common';
import { AnalyticsProvider } from '../infrastructure/database/analytics.provider';
import { RecordInteractionDto } from '../domain/dtos/metrics.dto';
import { AnalyticsInteractionResponseDto } from '../domain/dtos/analytics-interaction-response.dto';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';

@Injectable()
export class RecordInteractionUseCase extends BaseUseCase {
  constructor(
    private readonly analyticsProvider: AnalyticsProvider,
  ) {
    super(RecordInteractionUseCase.name);
  }

  async execute(userId: number, dto: RecordInteractionDto): Promise<AnalyticsInteractionResponseDto> {
    switch (dto.interactionType) {
      case 'view':
        return this.analyticsProvider.incrementContentView(
          dto.contentId,
          dto.contentType,
          userId,
          dto.viewSource
        );
      case 'like':
        return this.analyticsProvider.toggleContentReaction(
          dto.contentId,
          dto.contentType,
          userId
        );
      case 'viewDuration':
        if (!dto.durationSeconds) {
          throw new Error('durationSeconds is required for viewDuration interaction');
        }
        return this.analyticsProvider.recordViewDuration(
          dto.contentId,
          dto.contentType,
          dto.durationSeconds
        );
      case 'conversion':
        return this.analyticsProvider.recordConversion(
          dto.contentId,
          dto.contentType
        );
      case 'impression':
        return this.analyticsProvider.recordImpression(
          dto.contentId,
          dto.contentType
        );
      default:
        throw new Error(`Unsupported interaction type: ${dto.interactionType}`);
    }
  }
} 