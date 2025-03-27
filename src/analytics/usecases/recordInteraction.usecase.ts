import { Injectable } from '@nestjs/common';
import { AnalyticsProvider } from '../infrastructure/database/analytics.provider';
import { InteractionType } from '../domain/enums/interaction-types.enum';
import { RecordInteractionDto } from '../domain/dtos/metrics.dto';

@Injectable()
export class RecordInteractionUseCase {
  constructor(private readonly analyticsProvider: AnalyticsProvider) {}

  async execute(userId: number, dto: RecordInteractionDto): Promise<boolean | void> {
    switch (dto.interactionType) {
      case InteractionType.VIEW:
        await this.analyticsProvider.incrementContentView(
          dto.contentId, 
          dto.contentType,
          userId,
          dto.viewSource
        );
        return;
      
      case InteractionType.LIKE:
        return this.analyticsProvider.toggleContentReaction(
          dto.contentId,
          dto.contentType,
          userId
        );
      
      case InteractionType.IMPRESSION:
        await this.analyticsProvider.recordImpression(
          dto.contentId,
          dto.contentType
        );
        return;
      
      case InteractionType.CONVERSION:
        await this.analyticsProvider.recordConversion(
          dto.contentId,
          dto.contentType
        );
        return;
        
      default:
        throw new Error(`Unsupported interaction type: ${dto.interactionType}`);
    }
  }
} 