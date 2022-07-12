import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import {
  GeometryInterface,
  LocationInterface,
  ViewportInterface,
} from '../../domain/interfaces/geometry.interface';

const geometryExample: LocationInterface = {
  lat: -33.4228,
  lng: -70.6503,
};

export class LocationDto implements LocationInterface {
  @ApiProperty({
    example: geometryExample.lat,
    description: 'Latitud',
    required: true,
  })
  @IsNumber()
  @IsLatitude()
  @Expose()
  lat: number;

  @ApiProperty({
    example: geometryExample.lng,
    description: 'Longitud',
    required: true,
  })
  @IsNumber()
  @IsLongitude()
  @Expose()
  lng: number;
}

export class ViewPortDto implements ViewportInterface {
  @ApiProperty({
    example: geometryExample,
    description: 'Norte-este',
    required: true,
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  @Expose()
  northeast: LocationDto;

  @ApiProperty({
    example: geometryExample,
    description: 'Sur-oeste',
    required: true,
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  @Expose()
  southwest: LocationDto;
}

export class GeometryDto implements GeometryInterface {
  @ApiProperty({
    example: geometryExample,
    description: 'Location',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  @Expose()
  location: LocationDto;

  @ApiProperty({
    example: {
      northeast: geometryExample,
      southwest: geometryExample,
    } as ViewportInterface,
    description: 'Viewport',
    type: ViewPortDto,
  })
  @ValidateNested()
  @Type(() => ViewPortDto)
  @Expose()
  viewport: ViewPortDto;
}
