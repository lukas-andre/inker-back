# Google Places API Proxy Module

## Overview

This module provides a secure proxy for Google Places API to solve CORS issues when accessing the API from Flutter web applications. It includes rate limiting, caching, and proper error handling.

## Features

- **CORS-friendly proxy endpoints** for Google Places Autocomplete and Details APIs
- **Rate limiting** to prevent API quota exhaustion
- **Response caching** to reduce API calls and improve performance
- **Secure API key management** (server-side only)
- **Clean Architecture** following the project's patterns
- **Comprehensive error handling** with specific error types

## API Endpoints

### 1. Autocomplete Suggestions
```
GET /places/autocomplete?input={searchText}&sessionToken={optional}
```

**Response:**
```json
{
  "predictions": [
    {
      "placeId": "ChIJH_ximfDPYpYR_pGBUbiPJiw",
      "description": "Las Condes, Santiago, Chile",
      "structuredFormatting": {
        "mainText": "Las Condes",
        "secondaryText": "Santiago, Chile"
      }
    }
  ],
  "status": "OK"
}
```

### 2. Place Details
```
GET /places/details?placeId={placeId}&sessionToken={optional}
```

**Response:**
```json
{
  "name": "Las Condes",
  "formattedAddress": "Las Condes, Santiago, Chile",
  "addressComponents": [
    {
      "longName": "Las Condes",
      "shortName": "Las Condes",
      "types": ["locality", "political"]
    }
  ],
  "geometry": {
    "location": {
      "lat": -33.4089657,
      "lng": -70.5677358
    }
  },
  "status": "OK"
}
```

### 3. Parsed Address (Convenience Endpoint)
```
GET /places/details/parsed?placeId={placeId}&sessionToken={optional}
```

**Response:**
```json
{
  "streetNumber": "123",
  "street": "Av. Apoquindo",
  "city": "Las Condes",
  "zipCode": "7550000"
}
```

## Configuration

Add these environment variables to your `.env` file:

```env
# Required
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Optional (with defaults)
GOOGLE_PLACES_LANGUAGE=es-419            # Language for responses
GOOGLE_PLACES_COUNTRY=cl                 # Country restriction
GOOGLE_PLACES_RATE_LIMIT_PER_MINUTE=30   # Max requests per minute
GOOGLE_PLACES_RATE_LIMIT_PER_HOUR=1000   # Max requests per hour
GOOGLE_PLACES_CACHE_EXPIRY=3600          # Cache TTL in seconds
```

## Rate Limiting

The module implements a dual-bucket rate limiting strategy:
- **Per-minute limit**: 30 requests (configurable)
- **Per-hour limit**: 1000 requests (configurable)

When rate limits are exceeded, the API returns a 429 status code.

## Caching

Responses are cached to reduce API calls:
- **Autocomplete results**: Cached based on input and session token
- **Place details**: Cached by place ID (longer TTL since details rarely change)
- **Cache expiry**: Configurable, default 1 hour

## Error Handling

The module handles various error scenarios:
- `PlacesRateLimitError` (429): Rate limit exceeded
- `PlacesInvalidApiKeyError` (401): Invalid API key
- `PlacesQuotaExceededError` (429): Google API quota exceeded
- `PlacesApiError` (500): General API errors

## Frontend Integration

Update your Flutter service to use the proxy endpoints:

```dart
class GcpPlacesService implements PlacesService {
  final String baseUrl;
  
  GcpPlacesService({required this.baseUrl}); // e.g., 'http://localhost:3000/api'

  @override
  Future<List<Prediction>> getAutoComplete(String input) async {
    final uri = Uri.parse('$baseUrl/places/autocomplete').replace(
      queryParameters: {
        'input': input,
        'sessionToken': sessionToken,
      },
    );
    
    // Add authorization header if required
    final response = await http.get(
      uri,
      headers: {
        'Authorization': 'Bearer $authToken',
      },
    );
    
    // Handle response...
  }
}
```

## Architecture

The module follows Clean Architecture principles:

```
src/places/
├── domain/                 # Business logic layer
│   ├── interfaces/         # Service interfaces
│   ├── dtos/              # Domain DTOs
│   ├── errors/            # Custom error types
│   └── enums/             # Enumerations
├── infrastructure/         # Framework layer
│   ├── controllers/       # HTTP controllers
│   ├── dtos/             # Request/Response DTOs
│   └── services/         # External service integrations
├── usecases/              # Application business rules
└── places.module.ts       # NestJS module definition
```

## Security Considerations

1. **API Key Protection**: The Google Places API key is stored server-side only
2. **Authentication**: All endpoints are protected by AuthGuard
3. **Rate Limiting**: Prevents abuse and protects against quota exhaustion
4. **Input Validation**: All inputs are validated using class-validator

## Testing

To test the endpoints:

```bash
# Get autocomplete suggestions
curl -X GET "http://localhost:3000/api/places/autocomplete?input=Las%20Condes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get place details
curl -X GET "http://localhost:3000/api/places/details?placeId=ChIJH_ximfDPYpYR_pGBUbiPJiw" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get parsed address
curl -X GET "http://localhost:3000/api/places/details/parsed?placeId=ChIJH_ximfDPYpYR_pGBUbiPJiw" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Monitoring

Monitor the following metrics:
- Rate limit utilization (available via `getRemainingRequests()` method)
- Cache hit/miss ratio
- API response times
- Error rates by type

## Future Enhancements

1. **Per-user rate limiting**: Track limits by user ID instead of globally
2. **Redis cache**: Replace in-memory cache with Redis for scalability
3. **Webhook notifications**: Alert when approaching quota limits
4. **Analytics**: Track popular searches and locations
5. **Additional endpoints**: Support for more Google Places API features