import { Injectable } from '@nestjs/common';
import { RecordInteractionUseCase } from '../../analytics/usecases/recordInteraction.usecase';
import { RecordArtistViewUseCase } from '../../analytics/usecases/recordArtistView.usecase';
import { ContentType } from '../../analytics/domain/enums/content-types.enum';
import { InteractionType } from '../../analytics/domain/enums/interaction-types.enum';
import { CreateInteractionDto } from '../domain/dtos/interaction.dto';

@Injectable()
export class RecordAnalyticsUseCase {
  constructor(
    private readonly recordInteractionUseCase: RecordInteractionUseCase,
    private readonly recordArtistViewUseCase: RecordArtistViewUseCase,
  ) {}

  async execute(params: { userId: number; dto: CreateInteractionDto }): Promise<void> {
    const { userId, dto } = params;
    
    // Map interaction entity types to analytics content types
    let contentType: ContentType;
    
    switch (dto.entityType) {
      case 'stencil':
        contentType = ContentType.STENCIL;
        break;
      case 'work':
        contentType = ContentType.WORK;
        break;
      case 'artist':
        // For artist entity type, use the artist view endpoint
        await this.recordArtistViewUseCase.execute(userId, {
          artistId: dto.entityId,
        });
        return;
      default:
        // Skip recording for unsupported entity types
        return;
    }
    
    // Map interaction types to analytics interaction types
    let interactionType: InteractionType;
    
    switch (dto.interactionType) {
      case 'view':
        interactionType = InteractionType.VIEW;
        break;
      case 'like':
        interactionType = InteractionType.LIKE;
        break;
      default:
        // Skip recording for unsupported interaction types
        return;
    }
    
    // Record the interaction in analytics
    await this.recordInteractionUseCase.execute(userId, {
      contentId: dto.entityId,
      contentType,
      interactionType,
    });
  }
} 