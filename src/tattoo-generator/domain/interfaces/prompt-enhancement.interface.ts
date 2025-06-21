import { TattooStyle } from '../enums/tattooStyle.enum';

export interface PromptEnhancementParams {
  style: TattooStyle;
  userInput: string;
}

export abstract class IPromptEnhancementService {
  abstract enhancePrompt(params: PromptEnhancementParams): Promise<string>;
}
