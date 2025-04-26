import { Injectable, Logger } from '@nestjs/common';
import { getColorInstruction, TattooStyle, TattooStyleDescriptions } from '../../domain/enums/tattooStyle.enum';
import { IPromptEnhancementService, PromptEnhancementParams } from '../../domain/interfaces/prompt-enhancement.interface';
import { LibreTranslationService } from './libreTranslation.service';

@Injectable()
export class TattooPromptEnhancementService implements IPromptEnhancementService {
  private readonly logger = new Logger(TattooPromptEnhancementService.name);

  constructor(
    private readonly translationService: LibreTranslationService,
  ) { }

  async enhancePrompt(params: PromptEnhancementParams): Promise<string> {
    const { style, userInput } = params;

    try {
      const translatedInput = userInput ? await this.translationService.translate(userInput, 'auto', 'en') : 'a unique design'; 
      this.logger.log(`Translated user input: ${translatedInput}`);

      const styleDescriptionRaw = TattooStyleDescriptions[style as TattooStyle] || '';
      const styleKeywords = styleDescriptionRaw.split('|').map(s => s.trim()).filter(s => s.length > 0);

      const mainSubject = this.extractAndRefineConcepts(translatedInput);
      this.logger.log(`Refined main subject: ${mainSubject}`);

      const colorInstruction = getColorInstruction(style as TattooStyle);
      this.logger.log(`Color instruction for style ${style}: ${colorInstruction}`);

      const enhancedPrompt = `
        Generate a tattoo stencil design featuring: ${mainSubject}.
        The style should be ${style} tattoo style.
        Key characteristics to incorporate include: ${styleKeywords.join(', ')}.
        Render the design ${colorInstruction}.
        The final image should be an isolated tattoo design on a clean white background,
        presented as professional tattoo flash art on transfer paper.
        Ensure no body parts are visible, only the tattoo artwork itself.
      `.replace(/\s+/g, ' ').trim();

      this.logger.log(`Generated Enhanced Prompt: ${enhancedPrompt}`);
      return enhancedPrompt;

    } catch (error: any) {
      this.logger.error(`Error enhancing prompt: ${error.message || 'Unknown error'}`, error.stack);
      return this.basicEnhancement(params, userInput);
    }
  }

  private basicEnhancement(params: PromptEnhancementParams, originalUserInput: string): string {
    const { style } = params;
    const styleDescription = TattooStyleDescriptions[style as TattooStyle] || `style ${style}`;
    const subject = originalUserInput || 'tattoo design';

    return `
      Tattoo stencil design of ${subject},
      in the style of ${style}, characterized by ${styleDescription.split('|').join(', ')},
      isolated design on white background,
      professional tattoo transfer paper,
      clear linework.
    `.replace(/\s+/g, ' ').trim();
  }

  // TODO: Add a real enhancement
  private extractAndRefineConcepts(input: string): string {
    let refinedInput = input; 

    if (input.length > 0) {
      refinedInput = `Instruction:(this is a user instruction so please interpret the main subject of the tattoo design) ${input.toUpperCase()}`;
      this.logger.debug(`Applied generic enhancement for short input.`);
    }

    return refinedInput;
  }
}