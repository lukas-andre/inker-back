import { Inject, Injectable } from '@nestjs/common';
import { TattooImageDto, TattooImageResponseDto } from '../domain/dto/tattoo-image-response.dto';
import { TattooStyle } from '../domain/enums/tattoo-style.enum';
import { BaseComponent } from '../../global/domain/components/base.component';
import { RunwareImageGenerationService } from '../infrastructure/services/runware-image-generation.service';
import { IPromptEnhancementService } from '../domain/interfaces/prompt-enhancement.interface';
import { TattooPromptEnhancementService } from '../infrastructure/services/tattoo-prompt-enhancement.service';

interface GenerateTattooImagesParams {
  style: TattooStyle;
  userInput: string;
}

@Injectable()
export class GenerateTattooImagesUseCase extends BaseComponent{
  constructor(
    private readonly imageGenerationService: RunwareImageGenerationService,
    private readonly promptEnhancementService: TattooPromptEnhancementService,
  ) { 
    super(GenerateTattooImagesUseCase.name);
  }

  async execute(params: GenerateTattooImagesParams): Promise<TattooImageResponseDto> {
    const { style, userInput } = params;

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

    this.logger.log({
      images,
      enhancedPrompt,
      totalCost,
    });

    return {
      images,
      enhancedPrompt,
      totalCost,
    };
  }
} 