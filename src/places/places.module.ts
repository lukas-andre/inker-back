import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { PlacesController } from './infrastructure/controllers/places.controller';
import { IPRateLimitGuard } from './infrastructure/guards/ipRateLimit.guard';
import { GooglePlacesService } from './infrastructure/services/googlePlaces.service';
import { RateLimiterService } from './infrastructure/services/rateLimiter.service';
import { GetAutoCompleteUseCase } from './usecases/getAutoComplete.usecase';
import { GetPlaceDetailsUseCase } from './usecases/getPlaceDetails.usecase';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 5,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 30, // 30 requests per minute (global default)
      },
    ]),
  ],
  controllers: [PlacesController],
  providers: [
    // Guards
    IPRateLimitGuard,

    // Services
    GooglePlacesService,
    RateLimiterService,

    // Use Cases
    GetAutoCompleteUseCase,
    GetPlaceDetailsUseCase,
  ],
  exports: [
    // Export services if needed by other modules
    GooglePlacesService,
    RateLimiterService,
  ],
})
export class PlacesModule {}
