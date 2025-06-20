import { Injectable } from '@nestjs/common';
import { IPlacesService, Prediction } from '../domain/interfaces/placesService.interface';
import { RateLimiterService } from '../infrastructure/services/rateLimiter.service';
import { GooglePlacesService } from '../infrastructure/services/googlePlaces.service';
import { PlacesRateLimitError } from '../domain/errors/places.errors';

@Injectable()
export class GetAutoCompleteUseCase {
  constructor(
    private readonly placesService: GooglePlacesService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async execute(input: string, sessionToken?: string): Promise<Prediction[]> {
    const cacheKey = `autocomplete:${input}:${sessionToken || 'no-session'}`;
    
    // Check cache first
    const cachedResult = this.rateLimiter.getCachedResponse(cacheKey);
    if (cachedResult) {
      return cachedResult as Prediction[];
    }

    // Apply rate limiting
    const canProceed = await this.rateLimiter.tryAcquire();
    if (!canProceed) {
      throw new PlacesRateLimitError();
    }

    try {
      const predictions = await this.placesService.getAutoComplete(input, sessionToken);
      
      // Cache the result
      this.rateLimiter.cacheResponse(cacheKey, predictions);
      
      return predictions;
    } catch (error) {
      // Re-throw the error
      throw error;
    }
  }
}