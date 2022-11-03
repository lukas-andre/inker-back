import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { LocationDto } from './location.dto';

export class ArtistLocationDto extends LocationDto {
  @ApiProperty({ description: 'Artist id', example: 1 })
  @IsNumber()
  artistId: number;

  @ApiProperty({ description: 'Name', example: 'Juanart' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Profile thumbnail',
    example: 'https://www.google.com/',
  })
  @IsString()
  profileThumbnail?: string;

  @ApiProperty({ description: 'Google place id', example: '123' })
  @IsString()
  googlePlaceId?: string;
}
