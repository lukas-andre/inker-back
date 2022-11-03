import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInstance,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ArtistLocationDto } from './artistLocation.dto';

class Location {
  @ApiProperty({
    description: 'Type of the location',
    example: 'Point',
  })
  @IsString()
  readonly type: string;

  @ApiProperty({ description: 'Coordinates', example: [37.7749, -122.4194] })
  @IsString()
  readonly coordinates: number[];
}
export class FindArtistByRangeResponseDto extends OmitType(ArtistLocationDto, [
  'createdAt',
  'viewport',
  'updatedAt',
  'location',
]) {
  @ApiProperty({ description: 'Distance unit', example: 'Km' })
  @IsString()
  readonly distanceUnit: string;

  @ApiProperty({ description: 'Distance', example: 0.5 })
  @IsNumber()
  readonly distance: number;

  artist: RawFindByArtistIdsResponseDto;
}

export class RawContactResponseDto {
  @ApiProperty({ description: 'Phone number', example: '+56912345678' })
  @IsString()
  readonly phone: string;

  @ApiProperty({ description: 'Email', example: 'example@gmail.com' })
  @IsString()
  readonly email: string;

  @ApiProperty({ description: 'Contact country', example: 'CL' })
  @IsString()
  readonly country: string;
}

export class RawFindByArtistIdsResponseDto {
  @ApiProperty({
    description: 'contact',
  })
  @ValidateNested()
  @IsInstance(RawContactResponseDto)
  @Type(() => RawContactResponseDto)
  readonly contact: RawContactResponseDto;

  @ApiProperty({ description: 'Artist id', example: 1 })
  @IsNumber()
  readonly id: number;

  @ApiProperty({ description: 'Username', example: 'Juanart' })
  @IsString()
  readonly username: string;

  @ApiProperty({ description: 'Name', example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Art' })
  @IsString()
  readonly lastName: string;

  @ApiProperty({
    description: 'Short description',
    example: 'Juanart description',
  })
  @IsString()
  readonly shortDescription?: string;

  @ApiProperty({
    description: 'Profile thumbnail',
    example: 'https://www.google.com/',
  })
  readonly profileThumbnail?: string;

  @ApiProperty({ description: 'rating', example: 4.5 })
  @IsNumber()
  readonly rating: number;
}
