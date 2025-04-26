import { Injectable } from '@nestjs/common';
import { TattooStyle, TattooStyleDescriptions } from '../../domain/enums/tattoo-style.enum';
import { IPromptEnhancementService, PromptEnhancementParams } from '../../domain/interfaces/prompt-enhancement.interface';

@Injectable()
export class TattooPromptEnhancementService implements IPromptEnhancementService {
  async enhancePrompt(params: PromptEnhancementParams): Promise<string> {
    const { style, userInput } = params;
    
    // Get the style description from the enum
    const styleDescription = TattooStyleDescriptions[style as TattooStyle];
    
    // Extract key elements from user input
    const keyElements = this.extractKeyElements(userInput);
    
    // Construct the enhanced prompt
    const enhancedPrompt = `
      Tattoo stencil design of ${keyElements}, 
      ${styleDescription}, 
      isolated design on white background,
      tattoo flash art style,
      professional tattoo transfer paper,
      no body parts visible,
      just the tattoo design itself,
      clear outlines,
      suitable for tattoo application,
      clean design without context,
      presented as a tattoo stencil sheet
    `.replace(/\s+/g, ' ').trim();
    
    return enhancedPrompt;
  }
  
  private extractKeyElements(userInput: string): string {
    // Check for common tattoo subjects in Spanish and English
    const simplePrompt = userInput.toLowerCase();
    
    // Common Spanish-English translations for tattoo elements
    const elements = [
      { es: 'mano de fatima', en: 'Hand of Fatima (Hamsa)' },
      { es: 'mandala', en: 'mandala' },
      { es: 'flor', en: 'flower' },
      { es: 'rosa', en: 'rose' },
      { es: 'lobo', en: 'wolf' },
      { es: 'leon', en: 'lion' },
      { es: 'aguila', en: 'eagle' },
      { es: 'calavera', en: 'skull' },
      { es: 'brujula', en: 'compass' },
      { es: 'reloj', en: 'clock' },
      { es: 'ancla', en: 'anchor' },
      { es: 'arbol', en: 'tree' },
      { es: 'pluma', en: 'feather' },
      { es: 'mariposa', en: 'butterfly' },
      { es: 'dragon', en: 'dragon' },
      { es: 'serpiente', en: 'snake' },
      { es: 'corazon', en: 'heart' },
      { es: 'luna', en: 'moon' },
      { es: 'sol', en: 'sun' },
      { es: 'estrella', en: 'star' },
      { es: 'nombre', en: 'name script' },
      { es: 'flechas', en: 'arrows' },
      { es: 'triangulo', en: 'triangle' },
      { es: 'geometria', en: 'geometric shapes' },
      { es: 'infinito', en: 'infinity symbol' },
      { es: 'cruz', en: 'cross' },
      { es: 'alas', en: 'wings' },
      { es: 'atrapasueños', en: 'dreamcatcher' },
      { es: 'buho', en: 'owl' },
      { es: 'elefante', en: 'elephant' },
      { es: 'pavo real', en: 'peacock' },
      { es: 'espacio', en: 'space theme' },
      { es: 'galaxia', en: 'galaxy' },
      { es: 'montañas', en: 'mountains' },
      { es: 'olas', en: 'waves' },
      { es: 'barco', en: 'ship' },
      { es: 'brujula', en: 'compass' },
      { es: 'mapa', en: 'map' },
    ];
    
    // Check for placements
    const placements = [
      { es: 'antebrazo', en: 'forearm' },
      { es: 'brazo', en: 'arm' },
      { es: 'hombro', en: 'shoulder' },
      { es: 'espalda', en: 'back' },
      { es: 'pecho', en: 'chest' },
      { es: 'pierna', en: 'leg' },
      { es: 'tobillo', en: 'ankle' },
      { es: 'muñeca', en: 'wrist' },
      { es: 'cuello', en: 'neck' },
      { es: 'costado', en: 'side' },
      { es: 'mano', en: 'hand' },
      { es: 'pie', en: 'foot' },
      { es: 'costillas', en: 'ribs' },
      { es: 'muslo', en: 'thigh' },
      { es: 'nuca', en: 'nape' },
      { es: 'bicep', en: 'bicep' },
      { es: 'tricep', en: 'tricep' },
      { es: 'pantorrilla', en: 'calf' },
      { es: 'omoplato', en: 'shoulder blade' },
      { es: 'clavicula', en: 'collarbone' },
    ];
    
    // Find matched elements
    let matchedElements = '';
    for (const element of elements) {
      if (simplePrompt.includes(element.es)) {
        matchedElements += element.en + ' ';
      }
    }
    
    // If no elements were found, use a simplified version of the user input
    if (!matchedElements) {
      matchedElements = userInput;
    }
    
    // Don't include placement in the prompt since we want just the design
    // We'll extract it but not use it for the final prompt
    let placement = '';
    for (const p of placements) {
      if (simplePrompt.includes(p.es)) {
        placement = p.en;
        break;
      }
    }
    
    return matchedElements.trim();
  }
} 