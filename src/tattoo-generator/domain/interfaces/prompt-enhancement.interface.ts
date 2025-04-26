import { TattooStyle } from "../enums/tattoo-style.enum";

export interface PromptEnhancementParams {
  style: TattooStyle;
  userInput: string;
}

export abstract class IPromptEnhancementService {
  abstract enhancePrompt(params: PromptEnhancementParams): Promise<string>;
} 