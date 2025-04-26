import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { GenerateImageParams, GeneratedImage, IImageGenerationService } from '../../domain/interfaces/image-generation.interface';
import { runwareConfig } from '../../../config/runware.config';
import { HttpService } from '@nestjs/axios';


@Injectable()
export class RunwareImageGenerationService implements IImageGenerationService {
  private readonly apiKey: string;


  constructor(
    @Inject(runwareConfig.KEY)
    private runwareConf: ConfigType<typeof runwareConfig>,
    private readonly httpService: HttpService
  ) {
    this.apiKey = this.runwareConf.apiKey;
  }

  async generateImages(params: GenerateImageParams): Promise<GeneratedImage[]> {
    try {
      const { prompt, negativePrompt, numberOfImages, additionalParams } = params;

      // Use provided dimensions or fall back to default config
      const width = params.width || this.runwareConf.width;
      const height = params.height || this.runwareConf.height;

      // Extract CFG scale from additional params if provided
      const CFGScale = additionalParams?.CFGScale || this.runwareConf.CFGScale;

      const taskUUID = uuidv4();

      const response = await this.httpService.axiosRef.post(
        this.runwareConf.apiUrl,
        [
          {
            taskType: 'authentication',
            apiKey: this.apiKey,
          },
          {
            taskType: this.runwareConf.taskType,
            taskUUID,
            positivePrompt: prompt,
            negativePrompt: negativePrompt || undefined,
            width,
            height,
            model: this.runwareConf.model,
            steps: this.runwareConf.steps,
            CFGScale,
            numberResults: numberOfImages,
            outputType: 'URL',
            outputFormat: 'JPG',
            includeCost: this.runwareConf.includeCost,
          },
        ],
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data.data) {
        throw new Error('Failed to generate images');
      }

      // Extract the generated images from the response
      const generatedImages: GeneratedImage[] = response.data.data
        .filter(item => item.taskType === 'imageInference')
        .map(item => ({
          imageUrl: item.imageURL,
          imageId: item.imageUUID,
          cost: item.cost, // Include cost information if available
        }));

      // Log the total cost for monitoring
      if (this.runwareConf.includeCost) {
        const totalCost = generatedImages.reduce((sum, image) => sum + (image.cost || 0), 0);
        console.log(`Total cost for generating ${generatedImages.length} images: $${totalCost.toFixed(4)}`);
      }

      return generatedImages;
    } catch (error) {
      console.error('Error generating images with Runware:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate images: ${errorMessage}`);
    }
  }
} 