import { Inject, Injectable } from '@nestjs/common';
import { TattooImageDto, TattooImageResponseDto } from '../domain/dto/tattoo-image-response.dto';
import { TattooStyle } from '../domain/enums/tattoo-style.enum';
import { BaseComponent } from '../../global/domain/components/base.component';
import { RunwareImageGenerationService } from '../infrastructure/services/runwareImageGeneration.service';
import { IPromptEnhancementService } from '../domain/interfaces/prompt-enhancement.interface';
import { TattooPromptEnhancementService } from '../infrastructure/services/tattooPromptEnhancement.service';
import { TattooDesignCacheRepository } from '../infrastructure/database/repositories/tattooDesignCache.repository';

interface GenerateTattooImagesParams {
  style: TattooStyle;
  userInput: string;
}

@Injectable()
export class GenerateTattooImagesUseCase extends BaseComponent{
  private readonly SIMILARITY_THRESHOLD = 0.65;

  constructor(
    private readonly imageGenerationService: RunwareImageGenerationService,
    private readonly promptEnhancementService: TattooPromptEnhancementService,
    private readonly designCacheRepository?: TattooDesignCacheRepository,
  ) { 
    super(GenerateTattooImagesUseCase.name);
  }

  async execute(params: GenerateTattooImagesParams): Promise<TattooImageResponseDto> {
    const { style, userInput } = params;
    
    if (this.designCacheRepository) {
      try {
        const similarDesigns = await this.designCacheRepository.findSimilarByText(
          userInput,
          style,
          2,
          this.SIMILARITY_THRESHOLD
        );

        if (similarDesigns.length > 0 && similarDesigns[0].similarity > this.SIMILARITY_THRESHOLD) {
          const bestMatch = similarDesigns[0];
          this.logger.log(`Found cached design for query: "${userInput}" (similarity: ${bestMatch.similarity.toFixed(2)})`);
          
          await this.designCacheRepository.incrementUsageCount(bestMatch.id);
          
          const images: TattooImageDto[] = bestMatch.imageUrls.map((url, index) => ({
            imageUrl: url,
            imageId: `${bestMatch.id}-${index}`,
            cost: 0,
            fromCache: true,
          }));
          
          return {
            images,
            totalCost: 0,
            fromCache: true,
            similarityScore: bestMatch.similarity,
          };
        }
      } catch (error: any) {
        this.logger.warn(`Cache lookup failed, falling back to generation. Error: ${error.message || 'Unknown error'}`);
      }
    }

    const enhancedPrompt = await this.promptEnhancementService.enhancePrompt({
      userInput,
      style,
    });

    const negativePrompt = 'low quality, blurry, letter, text, watermark, signature, bad anatomy,' +
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

    if (this.designCacheRepository && images.length > 0) {
      try {
        const imageUrls = images.map(img => img.imageUrl);
        
        const designEntity = await this.designCacheRepository.save({
          userQuery: userInput,
          style,
          imageUrls,
          prompt: enhancedPrompt,
          metadata: {
            timestamp: new Date().toISOString(),
            totalCost,
            negativePrompt,
          },
        });
        
        if (designEntity?.id) {
          this.logger.log(`Stored design in cache with ID: ${designEntity.id}`);
        } else {
          this.logger.warn('Design was saved but no ID was returned');
        }
      } catch (error: any) {
        this.logger.warn(`Failed to cache design. Error: ${error.message || 'Unknown error'}`);
      }
    }

    this.logger.log({
      images,
      enhancedPrompt,
      totalCost,
    });

    return {
      images,
      totalCost,
      fromCache: false,
    };
  }
} 