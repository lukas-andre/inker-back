import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PlaceDetailsQueryDto {
  @ApiProperty({
    description:
      'The place ID of the place for which details are being requested',
    example: 'ChIJH_ximfDPYpYR_pGBUbiPJiw',
  })
  @IsString()
  @IsNotEmpty()
  placeId: string;

  @ApiProperty({
    description: 'Session token for billing purposes',
    required: false,
  })
  @IsString()
  @IsOptional()
  sessionToken?: string;
}

export class AddressComponentDto {
  @ApiProperty({
    description: 'The full text description or name of the address component',
    example: 'Las Condes',
  })
  longName: string;

  @ApiProperty({
    description: 'The abbreviated textual name for the address component',
    example: 'Las Condes',
  })
  shortName: string;

  @ApiProperty({
    description: 'Array indicating the type of the address component',
    example: ['locality', 'political'],
  })
  types: string[];
}

export class GeometryDto {
  @ApiProperty({
    description: 'The geocoded latitude and longitude coordinates',
  })
  location: {
    lat: number;
    lng: number;
  };
}

export class PlaceDetailsResponseDto {
  @ApiProperty({
    description: 'The human-readable name for the returned result',
    example: 'Las Condes',
  })
  name: string;

  @ApiProperty({
    description: 'A string containing the human-readable address of this place',
    example: 'Las Condes, Santiago, Chile',
  })
  formattedAddress: string;

  @ApiProperty({
    description:
      'Array containing the separate components applicable to this address',
    type: [AddressComponentDto],
  })
  addressComponents: AddressComponentDto[];

  @ApiProperty({
    description: 'Geometry information about the result',
    type: GeometryDto,
  })
  geometry: GeometryDto;

  @ApiProperty({
    description: 'API response status',
    example: 'OK',
  })
  status: string;
}

export class ParsedAddressDto {
  @ApiProperty({
    description: 'Street number extracted from address',
    example: '123',
  })
  streetNumber: string;

  @ApiProperty({
    description: 'Street name extracted from address',
    example: 'Av. Apoquindo',
  })
  street: string;

  @ApiProperty({
    description: 'City name extracted from address',
    example: 'Las Condes',
  })
  city: string;

  @ApiProperty({
    description: 'Zip/Postal code extracted from address',
    example: '7550000',
  })
  zipCode: string;
}
