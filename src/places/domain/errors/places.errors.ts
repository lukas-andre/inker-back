export class PlacesApiError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = 'PlacesApiError';
  }
}

export class PlacesQuotaExceededError extends PlacesApiError {
  constructor() {
    super('Google Places API quota exceeded', 429);
    this.name = 'PlacesQuotaExceededError';
  }
}

export class PlacesInvalidApiKeyError extends PlacesApiError {
  constructor() {
    super('Invalid Google Places API key', 401);
    this.name = 'PlacesInvalidApiKeyError';
  }
}

export class PlacesRateLimitError extends PlacesApiError {
  constructor() {
    super('Rate limit exceeded. Please try again later', 429);
    this.name = 'PlacesRateLimitError';
  }
}
