import { Injectable, Logger } from '@nestjs/common';
import { TattooStyle, TattooStyleDescriptions } from '../../domain/enums/tattoo-style.enum';
import { IPromptEnhancementService, PromptEnhancementParams } from '../../domain/interfaces/prompt-enhancement.interface';
import { ITranslationService } from '../../domain/interfaces/translation.interface';
import { LibreTranslationService } from './libre-translation.service';

@Injectable()
export class ImprovedTattooPromptEnhancementService implements IPromptEnhancementService {
  private readonly logger = new Logger(ImprovedTattooPromptEnhancementService.name);
  
  constructor(
    private readonly translationService: LibreTranslationService,
  ) {}

  async enhancePrompt(params: PromptEnhancementParams): Promise<string> {
    const { style, userInput } = params;
    
    try {
      // Detect language of user input
      const detectedLanguage = await this.translationService.detectLanguage(userInput);
      
      // Translate user input to English if it's not already in English
      const translatedInput = detectedLanguage !== 'en' 
        ? await this.translationService.translate(userInput, detectedLanguage, 'en')
        : userInput;
      
      // Get the style description from the enum
      const styleDescription = TattooStyleDescriptions[style as TattooStyle];
      
      // Extract key elements and refine the prompt
      const keyElements = this.extractAndRefineConcepts(translatedInput);
      
      // Construct the enhanced prompt with detailed instructions
      const enhancedPrompt = `
        Tattoo stencil design of ${keyElements}, 
        ${styleDescription}, 
        isolated design on white background,
        tattoo flash art style,
        professional tattoo transfer paper,
        no body parts visible,
        just the tattoo design itself
      `.replace(/\s+/g, ' ').trim();
      
      return enhancedPrompt;
    } catch (error: any) {
      this.logger.error(`Error enhancing prompt: ${error.message || 'Unknown error'}`, error.stack);
      // Fallback to basic enhancement if translation fails
      return this.basicEnhancement(params);
    }
  }
  
  private basicEnhancement(params: PromptEnhancementParams): string {
    const { style, userInput } = params;
    const styleDescription = TattooStyleDescriptions[style as TattooStyle];
    
    return `
      Tattoo stencil design of ${userInput}, 
      ${styleDescription}, 
      isolated design on white background,
      professional tattoo transfer paper
    `.replace(/\s+/g, ' ').trim();
  }
  
  private extractAndRefineConcepts(input: string): string {
    // Common concepts and their artistic enhancements
    const conceptEnhancements: Record<string, string> = {
      'flower': 'intricately detailed flower with organic flowing petals',
      'rose': 'elegant rose with detailed petals and subtle thorns',
      'wolf': 'majestic wolf with expressive features and detailed fur patterns',
      'lion': 'powerful lion with detailed mane and regal expression',
      'skull': 'anatomically detailed skull with crisp lines and defined structure',
      'compass': 'vintage compass with intricate details and directional markers',
      'butterfly': 'delicate butterfly with symmetrical wings and fine details',
      'dragon': 'mythical dragon with detailed scales and expressive features',
      'snake': 'coiled snake with detailed scales and smooth curves',
      'heart': 'anatomical heart with detailed arteries and organic structure',
      'moon': 'celestial moon with detailed craters and mystical elements',
      'sun': 'radiant sun with detailed rays and central motif',
      'star': 'geometric star with precise points and balanced proportions',
      'geometric': 'precise geometric pattern with perfect symmetry and clean lines',
      'mandala': 'intricate mandala with perfectly symmetrical patterns and detailed elements',
      'feather': 'delicate feather with fine details and natural texture',
      'anchor': 'nautical anchor with detailed rope and solid structure',
      'tree': 'detailed tree with intricate branches and symbolic roots',
      'mountains': 'majestic mountains with detailed ridges and natural contours',
      'wave': 'flowing wave with detailed curls and dynamic movement',
    };
    
    // Convert input to lowercase for matching
    const lowercaseInput = input.toLowerCase();
    
    // Check for matches with our enhanced concepts
    for (const [concept, enhancement] of Object.entries(conceptEnhancements)) {
      if (lowercaseInput.includes(concept)) {
        // Replace the basic concept with the enhanced version
        return input.replace(new RegExp(concept, 'i'), enhancement);
      }
    }
    
    // If no specific enhancement found, return the input with some general improvements
    if (input.length < 10) {
      return `intricately detailed ${input} with fine linework`;
    }
    
    return input;
  }
} 