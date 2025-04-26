export interface ITranslationService {
  translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string>;
  detectLanguage(text: string): Promise<string>;
} 