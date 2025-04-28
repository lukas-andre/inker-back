import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseComponent } from '../../global/domain/components/base.component';
import { TattooDesignCacheRepository } from '../infrastructure/database/repositories/tattooDesignCache.repository';
import { RequestContext } from '../../global/infrastructure/services/requestContext.service';

interface UpdateTattooFavoriteParams {
  designId: string;
  isFavorite: boolean;
}

@Injectable()
export class UpdateTattooFavoriteUseCase extends BaseComponent {
  constructor(
    private readonly designCacheRepository: TattooDesignCacheRepository,
  ) {
    super(UpdateTattooFavoriteUseCase.name);
  }

  async execute(params: UpdateTattooFavoriteParams, context: RequestContext): Promise<void> {
    const { designId, isFavorite } = params;
    const { id: userId, userType, userTypeId } = context;
    
    this.logger.log(`Updating favorite status for design ${designId} to ${isFavorite}`);

    try {
      // First verify the design exists and belongs to the user
      const query = `
        SELECT COUNT(*) AS count
        FROM tattoo_design_cache
        WHERE id = $1
        AND metadata->>'userId' = $2
        AND metadata->>'userType' = $3
        AND metadata->>'userTypeId' = $4
      `;
      
      const result = await this.designCacheRepository.executeRawQuery<{ count: string }>(query, [
        designId,
        userId,
        userType,
        userTypeId
      ]);
      
      const count = parseInt(result[0]?.count || '0', 10);
      
      if (count === 0) {
        throw new NotFoundException(`Design with ID ${designId} not found or does not belong to this user`);
      }
      
      // Update the favorite status
      await this.designCacheRepository.setFavorite(designId, isFavorite);
      
      this.logger.log(`Successfully updated favorite status for design ${designId}`);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error updating tattoo favorite status: ${error?.message || 'Unknown error'}`, error?.stack);
      throw new Error(`Failed to update favorite status: ${error?.message || 'Unknown error'}`);
    }
  }
} 