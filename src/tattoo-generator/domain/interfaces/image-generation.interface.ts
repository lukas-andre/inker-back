export interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numberOfImages?: number;
  additionalParams?: Record<string, any>;
}

export interface GeneratedImage {
  imageUrl: string;
  imageId: string;
  cost?: number;
}

export abstract class IImageGenerationService {
  abstract generateImages(params: GenerateImageParams): Promise<GeneratedImage[]>;
} 