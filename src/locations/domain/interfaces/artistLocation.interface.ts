import { Point } from 'geojson';
import { AddressType } from '../../../global/domain/interfaces/address.interface';
import { ViewportInterface } from '../../../global/domain/interfaces/geometry.interface';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ArtistLocationCreateDto {
  @ApiProperty({ description: 'Artist ID', example: 1 })
  @IsString()
  @IsNotEmpty()
  artistId: string;

  @ApiProperty({ description: 'Location name', example: 'My Studio' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address1: string;

  @ApiPropertyOptional({ description: 'Short address line 1', example: '123 Main' })
  @IsString()
  @IsOptional()
  shortAddress1?: string;

  @ApiProperty({ description: 'Address line 2', example: 'Suite 101' })
  @IsString()
  @IsNotEmpty()
  address2: string;

  @ApiPropertyOptional({ description: 'Address line 3', example: 'Building A' })
  @IsString()
  @IsOptional()
  address3?: string;

  @ApiPropertyOptional({ description: 'Address type', enum: AddressType })
  @IsEnum(AddressType)
  @IsOptional()
  addressType?: AddressType;

  @ApiPropertyOptional({ description: 'State', example: 'California' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'City', example: 'Los Angeles' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: 'Country', example: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Formatted address', example: '123 Main St, Los Angeles, CA' })
  @IsString()
  @IsOptional()
  formattedAddress?: string;

  @ApiProperty({ description: 'Latitude', example: 34.0522 })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ description: 'Longitude', example: -118.2437 })
  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @ApiPropertyOptional({ description: 'Viewport information' })
  @IsOptional()
  viewport?: ViewportInterface;

  @ApiPropertyOptional({ description: 'Location order', example: 1 })
  @IsNumber()
  @IsOptional()
  locationOrder?: number;

  @ApiPropertyOptional({ description: 'Google Place ID', example: 'ChIJE9on3F3HwoAR9AhGJW_fL-I' })
  @IsString()
  @IsOptional()
  googlePlaceId?: string;

  @ApiPropertyOptional({ description: 'Profile thumbnail URL', example: 'https://example.com/thumbnail.jpg' })
  @IsString()
  @IsOptional()
  profileThumbnail?: string;
}

export class ArtistLocationUpdateDto {
  @ApiProperty({ description: 'Location ID', example: 1 })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'My Studio' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  @IsOptional()
  address1?: string;

  @ApiPropertyOptional({ description: 'Short address line 1', example: '123 Main' })
  @IsString()
  @IsOptional()
  shortAddress1?: string;

  @ApiPropertyOptional({ description: 'Address line 2', example: 'Suite 101' })
  @IsString()
  @IsOptional()
  address2?: string;

  @ApiPropertyOptional({ description: 'Address line 3', example: 'Building A' })
  @IsString()
  @IsOptional()
  address3?: string;

  @ApiPropertyOptional({ description: 'Address type', enum: AddressType })
  @IsEnum(AddressType)
  @IsOptional()
  addressType?: AddressType;

  @ApiPropertyOptional({ description: 'State', example: 'California' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Los Angeles' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Formatted address', example: '123 Main St, Los Angeles, CA' })
  @IsString()
  @IsOptional()
  formattedAddress?: string;

  @ApiPropertyOptional({ description: 'Latitude', example: 34.0522 })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: -118.2437 })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiPropertyOptional({ description: 'GeoJSON Point location' })
  @IsOptional()
  location?: Point;

  @ApiPropertyOptional({ description: 'Viewport information' })
  @IsOptional()
  viewport?: ViewportInterface;

  @ApiPropertyOptional({ description: 'Location order', example: 1 })
  @IsNumber()
  @IsOptional()
  locationOrder?: number;

  @ApiPropertyOptional({ description: 'Google Place ID', example: 'ChIJE9on3F3HwoAR9AhGJW_fL-I' })
  @IsString()
  @IsOptional()
  googlePlaceId?: string;

  @ApiPropertyOptional({ description: 'Profile thumbnail URL', example: 'https://example.com/thumbnail.jpg' })
  @IsString()
  @IsOptional()
  profileThumbnail?: string;

  @ApiPropertyOptional({ description: 'Is location active', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ArtistLocationDto {
  @ApiProperty({ description: 'Location ID', example: 1 })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Artist ID', example: 1 })
  @IsString()
  artistId: string;

  @ApiProperty({ description: 'Location name', example: 'My Studio' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  address1: string;

  @ApiPropertyOptional({ description: 'Short address line 1', example: '123 Main' })
  @IsString()
  @IsOptional()
  shortAddress1?: string;

  @ApiProperty({ description: 'Address line 2', example: 'Suite 101' })
  @IsString()
  address2: string;

  @ApiPropertyOptional({ description: 'Address line 3', example: 'Building A' })
  @IsString()
  @IsOptional()
  address3?: string;

  @ApiProperty({ description: 'Address type', enum: AddressType })
  @IsEnum(AddressType)
  addressType: AddressType;

  @ApiPropertyOptional({ description: 'State', example: 'California' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'City', example: 'Los Angeles' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'Country', example: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Formatted address', example: '123 Main St, Los Angeles, CA' })
  @IsString()
  @IsOptional()
  formattedAddress?: string;

  @ApiProperty({ description: 'Latitude', example: 34.0522 })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude', example: -118.2437 })
  @IsNumber()
  lng: number;

  @ApiPropertyOptional({ description: 'Viewport information' })
  @IsOptional()
  viewport?: ViewportInterface;

  @ApiProperty({ description: 'GeoJSON Point location' })
  location: Point;

  @ApiProperty({ description: 'Location order', example: 1 })
  @IsNumber()
  locationOrder: number;

  @ApiPropertyOptional({ description: 'Google Place ID', example: 'ChIJE9on3F3HwoAR9AhGJW_fL-I' })
  @IsString()
  @IsOptional()
  googlePlaceId?: string;

  @ApiPropertyOptional({ description: 'Profile thumbnail URL', example: 'https://example.com/thumbnail.jpg' })
  @IsString()
  @IsOptional()
  profileThumbnail?: string;

  @ApiProperty({ description: 'Is location active', example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Creation date', example: '2023-01-01T00:00:00Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', example: '2023-01-01T00:00:00Z' })
  @IsDate()
  updatedAt: Date;
}

export class GetArtistLocationsParams {
  @ApiProperty({ description: 'Artist ID', example: 1 })
  @IsString()
  @IsNotEmpty()
  artistId: string;
}

export class DeleteArtistLocationParams {
  @ApiProperty({ description: 'Location ID', example: 1 })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Artist ID', example: 1 })
  @IsString()
  @IsNotEmpty()
  artistId: string;
}