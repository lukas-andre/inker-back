import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInstance,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ArtistLocationDto } from './artistLocation.dto';

export class FindArtistByRangeResponseDto extends OmitType(ArtistLocationDto, [
  'createdAt',
  'viewport',
  'updatedAt',
  'location',
]) {
  @ApiProperty({
    description: 'Artist id',
    example: {
      coordinates: [37.7749, -122.4194],
      type: 'Point',
    } as Location,
  })
  location: Location;

  @ApiProperty({ description: 'Distance unit', example: 'Km' })
  @IsString()
  distanceUnit: string;
  @ApiProperty({ description: 'Distance', example: 0.5 })
  @IsNumber()
  distance: number;

  artist: RawFindByArtistIdsResponse;
}

export interface Location {
  type: string;
  coordinates: number[];
}

export class RawContactResponseDto {
  @ApiProperty({ description: 'Phone number', example: '+56912345678' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Email', example: 'example@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Contact country', example: 'CL' })
  @IsString()
  country: string;
}

export class RawFindByArtistIdsResponse {
  @ApiProperty({
    description: 'contact',
  })
  @ValidateNested()
  @IsInstance(RawContactResponseDto)
  @Type(() => RawContactResponseDto)
  contact: RawContactResponseDto;

  @ApiProperty({ description: 'Artist id', example: 1 })
  @IsNumber()
  id: number;
  @ApiProperty({ description: 'Username', example: 'Juanart' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Name', example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Art' })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Short description',
    example: 'Juanart description',
  })
  @IsString()
  shortDescription?: string;

  @ApiProperty({
    description: 'Profile thumbnail',
    example: 'https://www.google.com/',
  })
  profileThumbnail?: string;

  @ApiProperty({ description: 'rating', example: 4.5 })
  @IsNumber()
  rating: number;
}
