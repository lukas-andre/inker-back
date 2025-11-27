import { Injectable } from '@nestjs/common';

import { PlacesRateLimitError } from '../domain/errors/places.errors';
import { PlaceDetails } from '../domain/interfaces/placesService.interface';
import { GooglePlacesService } from '../infrastructure/services/googlePlaces.service';
import { RateLimiterService } from '../infrastructure/services/rateLimiter.service';

@Injectable()
export class GetPlaceDetailsUseCase {
  constructor(
    private readonly placesService: GooglePlacesService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  async execute(placeId: string, sessionToken?: string): Promise<any | null> {
    const cacheKey = `details:${placeId}`;

    // Check cache first
    const cachedResult = this.rateLimiter.getCachedResponse(cacheKey);
    if (cachedResult) {
      return cachedResult as PlaceDetails;
    }

    // Apply rate limiting
    const canProceed = await this.rateLimiter.tryAcquire();
    if (!canProceed) {
      throw new PlacesRateLimitError();
    }

    try {
      const details = await this.placesService.getPlaceDetails(
        placeId,
        sessionToken,
      );

      if (details) {
        // Cache the result for longer since place details don't change often
        this.rateLimiter.cacheResponse(cacheKey, details);
      }

      return details;
    } catch (error) {
      // Re-throw the error
      throw error;
    }
  }
}
