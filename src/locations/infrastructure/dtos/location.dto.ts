import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Point } from 'geojson';

import { BaseDTO } from '../../../global/domain/dtos/base.dto';
import { AddressType } from '../../../global/domain/interfaces/address.interface';
import { ViewportInterface } from '../../../global/domain/interfaces/geometry.interface';
import { LocationModel } from '../../domain/model/location.model';

export class LocationDTO extends BaseDTO implements LocationModel {
  @ApiProperty({ description: 'Short address line 1', example: '123 Main St' })
  @IsString()
  shortAddress1: string;

  @ApiProperty({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  address1: string;

  @ApiProperty({ description: 'Address line 2', example: 'Suite 100' })
  @IsString()
  address2: string;

  @ApiProperty({ description: 'Address line 3', example: 'Apt. 100' })
  @IsString()
  address3?: string;

  @ApiProperty({
    description: 'Address type',
    example: AddressType.DEPARTMENT,
    enum: AddressType,
    enumName: 'AddressType',
  })
  @IsEnum(AddressType)
  addressType: AddressType;

  @ApiProperty({ description: 'State', example: 'CA' })
  @IsString()
  state?: string;

  @ApiProperty({ description: 'City', example: 'San Francisco' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Country', example: 'USA' })
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'Formatted address',
    example: '123 Main St, Suite 100, Apt. 100, San Francisco, CA, USA',
  })
  @IsString()
  formattedAddress?: string;

  @ApiProperty({ description: 'Latitude', example: 37.7749 })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude', example: -122.4194 })
  @IsNumber()
  lng: number;

  @ApiProperty({
    description: 'Viewport',
    example: {
      northeast: { lat: 37.7749, lng: -122.4194 },
      southwest: { lat: 37.7749, lng: -122.4194 },
    } as ViewportInterface,
  })
  //   @IsInstance(ViewportInterface) TODO: Create viewport dto
  viewport?: ViewportInterface;

  @ApiProperty({
    description: 'Location',
    example: { type: 'Point', coordinates: [37.7749, -122.4194] } as Point,
  })
  // TODO: Create point dto
  location: Point;

  @ApiProperty({ description: 'Location Id', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Location Created At',
    example: '2020-01-01T00:00:00.000Z',
  })
  @IsString()
  createdAt: Date;

  @ApiProperty({
    description: 'Location Updated At',
    example: '2020-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
