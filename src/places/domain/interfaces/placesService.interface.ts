export interface Prediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
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
}

export interface IPlacesService {
  getAutoComplete(input: string, sessionToken?: string): Promise<Prediction[]>;
  getPlaceDetails(placeId: string, sessionToken?: string): Promise<PlaceDetails | null>;
}