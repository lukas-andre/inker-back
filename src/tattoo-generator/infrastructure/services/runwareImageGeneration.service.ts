import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

import { runwareConfig } from '../../../config/runware.config';
import { BaseComponent } from '../../../global/domain/components/base.component';
import {
  GenerateImageParams,
  GeneratedImage,
  IImageGenerationService,
} from '../../domain/interfaces/image-generation.interface';

@Injectable()
export class RunwareImageGenerationService
  extends BaseComponent
  implements IImageGenerationService
{
  private readonly apiKey: string;

  constructor(
    @Inject(runwareConfig.KEY)
    private runwareConf: ConfigType<typeof runwareConfig>,
    private readonly httpService: HttpService,
  ) {
    super(RunwareImageGenerationService.name);
    this.apiKey = this.runwareConf.apiKey;
  }

  async generateImages(params: GenerateImageParams): Promise<GeneratedImage[]> {
    return this.executeWithRetry(() => this.performImageGeneration(params));
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    let delay = this.runwareConf.retry.initialDelayMs;
    const { maxRetries, maxDelayMs, backoffFactor } = this.runwareConf.retry;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          this.logger.warn(
            `Attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`,
          );

          await this.sleep(delay);

          // Apply exponential backoff with jitter for next retry
          delay = Math.min(
            delay * backoffFactor * (0.8 + Math.random() * 0.4),
            maxDelayMs,
          );
        }
      }
    }

    this.logger.error(
      `Failed after ${maxRetries} attempts: ${lastError.message}`,
    );
    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async performImageGeneration(
    params: GenerateImageParams,
  ): Promise<GeneratedImage[]> {
    const { prompt, negativePrompt, numberOfImages, additionalParams } = params;

    // Use provided dimensions or fall back to default config
    const width = params.width || this.runwareConf.width;
    const height = params.height || this.runwareConf.height;

    // Extract CFG scale from additional params if provided
    const CFGScale = additionalParams?.CFGScale || this.runwareConf.CFGScale;

    const taskUUID = uuidv4();

    this.logger.log(
      `Generating ${numberOfImages} images with prompt: "${prompt.substring(
        0,
        50,
      )}..."`,
    );

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
        timeout: 30000, // 30 second timeout
      },
    );

    if (!response.data.data) {
      throw new Error('Failed to generate images: No data returned from API');
    }

    // Extract the generated images from the response
    const generatedImages: GeneratedImage[] = response.data.data
      .filter(item => item.taskType === 'imageInference')
      .map(item => ({
        imageUrl: item.imageURL,
        imageId: item.imageUUID,
        cost: item.cost, // Include cost information if available
      }));

    if (generatedImages.length === 0) {
      throw new Error('No images were generated in the response');
    }

    // Log the total cost for monitoring
    if (this.runwareConf.includeCost) {
      const totalCost = generatedImages.reduce(
        (sum, image) => sum + (image.cost || 0),
        0,
      );
      this.logger.log(
        `Total cost for generating ${
          generatedImages.length
        } images: $${totalCost.toFixed(4)}`,
      );
    }

    this.logger.log(`Successfully generated ${generatedImages.length} images`);
    return generatedImages;
  }
}
