export class PlaceDto {
  streetNumber: string;
  street: string;
  city: string;
  zipCode: string;

  constructor(data: Partial<PlaceDto>) {
    this.streetNumber = data.streetNumber || '';
    this.street = data.street || '';
    this.city = data.city || '';
    this.zipCode = data.zipCode || '';
  }
}

export class SuggestionDto {
  placeId: string;
  description: string;

  constructor(placeId: string, description: string) {
    this.placeId = placeId;
    this.description = description;
  }
}
