import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { PlacesApiError } from '../../domain/errors/places.errors';
import { GetAutoCompleteUseCase } from '../../usecases/getAutoComplete.usecase';
import { GetPlaceDetailsUseCase } from '../../usecases/getPlaceDetails.usecase';
import {
  AutoCompleteQueryDto,
  AutoCompleteResponseDto,
} from '../dtos/autoComplete.dto';
import {
  ParsedAddressDto,
  PlaceDetailsQueryDto,
  PlaceDetailsResponseDto,
} from '../dtos/placeDetails.dto';
import { IPRateLimitGuard } from '../guards/ipRateLimit.guard';

@ApiTags('Places')
@Controller('places')
@UseGuards(IPRateLimitGuard)
export class PlacesController {
  constructor(
    private readonly getAutoCompleteUseCase: GetAutoCompleteUseCase,
    private readonly getPlaceDetailsUseCase: GetPlaceDetailsUseCase,
  ) {}

  @Get('autocomplete')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  @ApiOperation({
    summary: 'Get place suggestions based on input text',
    description:
      'Proxy endpoint for Google Places Autocomplete API with rate limiting',
  })
  @ApiQuery({
    name: 'input',
    description: 'The text string on which to search',
    example: 'Las Condes',
  })
  @ApiQuery({
    name: 'sessionToken',
    description: 'Session token for billing purposes',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response with predictions',
    type: AutoCompleteResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input',
  })
  async getAutoComplete(
    @Query() query: AutoCompleteQueryDto,
  ): Promise<AutoCompleteResponseDto> {
    try {
      const predictions = await this.getAutoCompleteUseCase.execute(
        query.input,
        query.sessionToken,
      );

      return {
        predictions: predictions.map(p => ({
          placeId: p.place_id,
          description: p.description,
          structuredFormatting: p.structured_formatting
            ? {
                mainText: p.structured_formatting.main_text,
                secondaryText: p.structured_formatting.secondary_text,
              }
            : undefined,
        })),
        status: 'OK',
      };
    } catch (error) {
      if (error instanceof PlacesApiError) {
        throw new HttpException(error.message, error.statusCode);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('details')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @ApiOperation({
    summary: 'Get detailed information about a specific place',
    description:
      'Proxy endpoint for Google Places Details API with rate limiting',
  })
  @ApiQuery({
    name: 'placeId',
    description:
      'The place ID of the place for which details are being requested',
    example: 'ChIJH_ximfDPYpYR_pGBUbiPJiw',
  })
  @ApiQuery({
    name: 'sessionToken',
    description: 'Session token for billing purposes',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response with place details',
    type: PlaceDetailsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Place not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  async getPlaceDetails(
    @Query() query: PlaceDetailsQueryDto,
  ): Promise<PlaceDetailsResponseDto | null> {
    try {
      const details = await this.getPlaceDetailsUseCase.execute(
        query.placeId,
        query.sessionToken,
      );

      if (!details) {
        throw new HttpException('Place not found', HttpStatus.NOT_FOUND);
      }

      return details;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof PlacesApiError) {
        throw new HttpException(error.message, error.statusCode);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('details/parsed')
  @Throttle({ default: { limit: 15, ttl: 60000 } }) // 15 requests per minute
  @ApiOperation({
    summary: 'Get parsed address components from a place',
    description: 'Returns structured address data extracted from place details',
  })
  @ApiQuery({
    name: 'placeId',
    description:
      'The place ID of the place for which details are being requested',
    example: 'ChIJH_ximfDPYpYR_pGBUbiPJiw',
  })
  @ApiQuery({
    name: 'sessionToken',
    description: 'Session token for billing purposes',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response with parsed address',
    type: ParsedAddressDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Place not found',
  })
  async getParsedAddress(
    @Query() query: PlaceDetailsQueryDto,
  ): Promise<ParsedAddressDto> {
    try {
      const details = await this.getPlaceDetailsUseCase.execute(
        query.placeId,
        query.sessionToken,
      );

      if (!details) {
        throw new HttpException('Place not found', HttpStatus.NOT_FOUND);
      }

      const addressComponents = details.address_components;

      const getComponent = (types: string[]): string => {
        const component = addressComponents.find(c =>
          types.some(type => c.types.includes(type)),
        );
        return component?.long_name || '';
      };

      return {
        streetNumber: getComponent(['street_number']),
        street: getComponent(['route']),
        city: getComponent(['locality', 'administrative_area_level_3']),
        zipCode: getComponent(['postal_code']),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof PlacesApiError) {
        throw new HttpException(error.message, error.statusCode);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
