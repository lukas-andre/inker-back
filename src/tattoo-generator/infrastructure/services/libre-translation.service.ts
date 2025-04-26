import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ITranslationService } from '../../domain/interfaces/translation.interface';

@Injectable()
export class LibreTranslationService implements ITranslationService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly logger = new Logger(LibreTranslationService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('LIBRETRANSLATE_URL', 'http://localhost:5000');
    this.apiKey = this.configService.get<string>('LIBRETRANSLATE_API_KEY', '');
  }

  async translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      if (!text) {
        return '';
      }

      // Auto-detect if source language is 'auto'
      const source = sourceLanguage === 'auto' 
        ? await this.detectLanguage(text)
        : sourceLanguage;

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/translate`, {
          q: text,
          source: source,
          target: targetLanguage,
          api_key: this.apiKey,
        })
      );

      return response.data.translatedText;
    } catch (error: any) {
      this.logger.error(`Translation error: ${error.message || 'Unknown error'}`, error.stack);
      return text; // Return original text on failure
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      if (!text) {
        return 'en';
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/detect`, {
          q: text,
          api_key: this.apiKey,
        })
      );

      if (response.data && response.data.length > 0) {
        return response.data[0].language;
      }
      
      return 'en'; // Default to English if detection fails
    } catch (error: any) {
      this.logger.error(`Language detection error: ${error.message || 'Unknown error'}`, error.stack);
      return 'en'; // Default to English on error
    }
  }
} 