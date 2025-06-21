import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from '@nestjs/terminus/dist/utils';
import { firstValueFrom } from 'rxjs';

import { PlacesApiStatus, PlacesCountry } from '../../domain/enums/places.enum';
import {
  PlacesApiError,
  PlacesInvalidApiKeyError,
  PlacesQuotaExceededError,
} from '../../domain/errors/places.errors';
import {
  IPlacesService,
  PlaceDetails,
  Prediction,
} from '../../domain/interfaces/placesService.interface';

interface GoogleAutoCompleteResponse {
  predictions: Array<{
    description: string;
    place_id: string;
    structured_formatting?: {
      main_text: string;
      secondary_text: string;
    };
  }>;
  status: string;
}

interface GooglePlaceDetailsResponse {
  result?: {
    formatted_address: string;
    name: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  };
  status: string;
}

@Injectable()
export class GooglePlacesService implements IPlacesService {
  private readonly apiKey: string;
  private readonly language: string;
  private readonly country: string;
  private readonly baseUrl: string =
    'https://maps.googleapis.com/maps/api/place';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('places.apiKey');
    this.language = this.configService.get<string>('places.language', 'es-419');
    this.country = this.configService.get<string>(
      'places.country',
      PlacesCountry.CHILE,
    );

    if (!this.apiKey) {
      throw new Error('Google Places API key is not configured');
    }
  }

  async getAutoComplete(
    input: string,
    sessionToken?: string,
  ): Promise<Prediction[]> {
    const url = `${this.baseUrl}/autocomplete/json`;

    const params: any = {
      input,
      key: this.apiKey,
      language: this.language,
      components: `country:${this.country}`,
    };

    if (sessionToken) {
      params.sessiontoken = sessionToken;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<GoogleAutoCompleteResponse>(url, { params }),
      );

      const { data } = response;

      switch (data.status) {
        case PlacesApiStatus.OK:
          return data.predictions.map(p => ({
            description: p.description,
            place_id: p.place_id,
            structured_formatting: p.structured_formatting,
          }));

        case PlacesApiStatus.ZERO_RESULTS:
          return [];

        case PlacesApiStatus.REQUEST_DENIED:
          throw new PlacesInvalidApiKeyError();

        case PlacesApiStatus.OVER_QUERY_LIMIT:
          throw new PlacesQuotaExceededError();

        default:
          throw new PlacesApiError(`Google Places API error: ${data.status}`);
      }
    } catch (error) {
      if (error instanceof PlacesApiError) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw new PlacesApiError(
          `Google Places API request failed: ${error.response.statusText}`,
          error.response.status,
        );
      }

      throw new PlacesApiError('Failed to connect to Google Places API');
    }
  }

  async getPlaceDetails(
    placeId: string,
    sessionToken?: string,
  ): Promise<any | null> {
    const url = `${this.baseUrl}/details/json`;

    const params: any = {
      place_id: placeId,
      key: this.apiKey,
      language: this.language,
      fields: 'formatted_address,name,geometry,address_components',
    };

    if (sessionToken) {
      params.sessiontoken = sessionToken;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<GooglePlaceDetailsResponse>(url, { params }),
      );

      const { data } = response;

      switch (data.status) {
        case PlacesApiStatus.OK:
          if (!data.result) {
            return null;
          }
          return data;

        case PlacesApiStatus.ZERO_RESULTS:
        case PlacesApiStatus.INVALID_REQUEST:
          return null;

        case PlacesApiStatus.REQUEST_DENIED:
          throw new PlacesInvalidApiKeyError();

        case PlacesApiStatus.OVER_QUERY_LIMIT:
          throw new PlacesQuotaExceededError();

        default:
          throw new PlacesApiError(`Google Places API error: ${data.status}`);
      }
    } catch (error) {
      if (error instanceof PlacesApiError) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw new PlacesApiError(
          `Google Places API request failed: ${error.response.statusText}`,
          error.response.status,
        );
      }

      throw new PlacesApiError('Failed to connect to Google Places API');
    }
  }
}
