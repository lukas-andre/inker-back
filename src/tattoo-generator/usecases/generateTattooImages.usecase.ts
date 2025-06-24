import { HttpException, Injectable } from '@nestjs/common';

import { BaseComponent } from '../../global/domain/components/base.component';
import { RequestContext } from '../../global/infrastructure/services/requestContext.service';
import { InsufficientTokensError } from '../../tokens/domain/errors/insufficient-tokens.error';
import { ConsumeTokensUseCase } from '../../tokens/usecases/consume-tokens.usecase';
import { GetTokenBalanceUseCase } from '../../tokens/usecases/get-token-balance.usecase';
import {
  TattooImageDto,
  TattooImageResponseDto,
} from '../domain/dto/tattoo-image-response.dto';
import { TattooStyle } from '../domain/enums/tattooStyle.enum';
import { TattooDesignCacheEntity } from '../infrastructure/database/entities/tattooDesignCache.entity';
import { TattooDesignCacheRepository } from '../infrastructure/database/repositories/tattooDesignCache.repository';
import { RunwareImageGenerationService } from '../infrastructure/services/runwareImageGeneration.service';
import { TattooPromptEnhancementService } from '../infrastructure/services/tattooPromptEnhancement.service';

interface GenerateTattooImagesParams {
  style: TattooStyle;
  userInput: string;
}

@Injectable()
export class GenerateTattooImagesUseCase extends BaseComponent {
  private readonly SIMILARITY_THRESHOLD = 0.65;

  constructor(
    private readonly imageGenerationService: RunwareImageGenerationService,
    private readonly promptEnhancementService: TattooPromptEnhancementService,
    private readonly consumeTokensUseCase: ConsumeTokensUseCase,
    private readonly getTokenBalanceUseCase: GetTokenBalanceUseCase,
    private readonly designCacheRepository?: TattooDesignCacheRepository,
  ) {
    super(GenerateTattooImagesUseCase.name);
  }

  async execute(
    params: GenerateTattooImagesParams,
    context: RequestContext,
  ): Promise<TattooImageResponseDto> {
    const { style, userInput } = params;
    const { id, userType, userTypeId } = context;

    if (this.designCacheRepository) {
      try {
        const similarDesigns =
          await this.designCacheRepository.findSimilarByText(
            userInput,
            style,
            2,
            this.SIMILARITY_THRESHOLD,
          );

        if (
          similarDesigns.length > 0 &&
          similarDesigns[0].similarity > this.SIMILARITY_THRESHOLD
        ) {
          const bestMatch = similarDesigns[0];
          this.logger.log(
            `Found cached design for query: "${userInput}" (similarity: ${bestMatch.similarity.toFixed(
              2,
            )})`,
          );

          await this.designCacheRepository.incrementUsageCount(bestMatch.id);

          const images: TattooImageDto[] = bestMatch.imageUrls.map(
            (url, index) => ({
              imageUrl: url,
              imageId: `${bestMatch.id}-${index}`,
              cost: 0,
              fromCache: true,
            }),
          );

          // Get current balance but don't consume tokens for cached results
          const balance = await this.getTokenBalanceUseCase.execute({
            userId: id,
            userType,
            userTypeId,
          });

          return {
            images,
            totalCost: 0,
            fromCache: true,
            similarityScore: bestMatch.similarity,
            tokenBalance: balance.balance,
            tokensConsumed: 0,
          };
        }
      } catch (error: any) {
        this.logger.warn(
          `Cache lookup failed, falling back to generation. Error: ${
            error.message || 'Unknown error'
          }`,
        );
      }
    }

    // Consume tokens before generating new images
    let tokenBalance: number;
    let transactionId: string | undefined;
    const tokensToConsume = 1; // 1 token per generation
    
    try {
      const consumeResult = await this.consumeTokensUseCase.execute({
        userId: id,
        userType,
        userTypeId,
        amount: tokensToConsume,
        metadata: {
          tattooGenerationId: `${Date.now()}-${id}`,
          prompt: userInput,
          runwareCost: 0.06,          // runwareCost will be updated after generation
        },
      });
      
      tokenBalance = consumeResult.newBalance;
      transactionId = consumeResult.transaction?.id;
      this.logger.log(`Consumed ${tokensToConsume} token(s). New balance: ${tokenBalance}`);
    } catch (error) {
      if (error instanceof InsufficientTokensError) {
        this.logger.warn(`Insufficient tokens for user ${id}. Balance: ${error.currentBalance}, Required: ${error.requestedAmount}`);
        throw new HttpException(
          {
            statusCode: 402,
            message: 'Insufficient tokens to generate images',
            error: 'Payment Required',
            currentBalance: error.currentBalance,
            requiredTokens: error.requestedAmount,
          },
          402,
        );
      }
      throw error;
    }

    const enhancedPrompt = await this.promptEnhancementService.enhancePrompt({
      userInput,
      style,
    });

    const negativePrompt =
      'low quality, blurry, letter, text, watermark, signature, bad anatomy,' +
      'duplicate, missing limbs, extra limbs, bad hands, bad fingers, cropped, ' +
      'out of frame, grainy, pixelated, jpeg artifacts, ' +
      'poor resolution, multiple tattoos';

    const generatedImages = await this.imageGenerationService.generateImages({
      prompt: enhancedPrompt,
      negativePrompt,
      numberOfImages: 2,
    });

    const images: TattooImageDto[] = generatedImages.map(image => ({
      imageUrl: image.imageUrl,
      imageId: image.imageId,
      cost: image.cost,
    }));

    let totalCost: number | undefined;
    if (images.some(img => img.cost !== undefined)) {
      totalCost = images.reduce((sum, img) => sum + (img.cost || 0), 0);
    }
    let designEntity: TattooDesignCacheEntity | undefined;
    if (this.designCacheRepository && images.length > 0) {
      try {
        const imageUrls = images.map(img => img.imageUrl);

        designEntity = await this.designCacheRepository.save({
          userQuery: userInput,
          style,
          imageUrls,
          prompt: enhancedPrompt,
          metadata: {
            timestamp: new Date().toISOString(),
            totalCost,
            negativePrompt,
            userId: id,
            userType,
            userTypeId,
          },
        });

        if (designEntity?.id) {
          this.logger.log(`Stored design in cache with ID: ${designEntity.id}`);
        } else {
          this.logger.warn('Design was saved but no ID was returned');
        }
      } catch (error: any) {
        this.logger.warn(
          `Failed to cache design. Error: ${error.message || 'Unknown error'}`,
        );
      }
    }

    this.logger.log({
      images,
      enhancedPrompt,
      totalCost,
    });

    // Log the actual Runware cost
    if (totalCost !== undefined) {
      this.logger.log(`Runware generation cost: $${totalCost} for transaction ${transactionId}`);
    }

    return {
      images: images.map(image => ({
        ...image,
        imageId: designEntity?.id || image.imageId,
      })),
      totalCost,
      fromCache: false,
      tokenBalance,
      tokensConsumed: tokensToConsume,
    };
  }
}
