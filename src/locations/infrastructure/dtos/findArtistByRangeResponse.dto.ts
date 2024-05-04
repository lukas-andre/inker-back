import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInstance,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ReviewDto } from '../../../reviews/dtos/review.dto';
import { ReviewAvgDTO } from '../../../reviews/dtos/reviewAvg.dto';

import { ArtistLocationDTO } from './artistLocation.dto';
import { CustomerReviewReactionDetailsDTO } from './customerReviewReactionDetail.dto';
import { RecentWorkDTO } from './recentWork.dto';

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
export class FindArtistByRangeResponseDTO extends OmitType(ArtistLocationDTO, [
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

  artist: RawFindByArtistIdsResponseDTO;
}

export class RawContactResponseDTO {
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

class RawFindByArtistIdsReviewsDTO extends OmitType(ReviewDto, ['updatedAt']) {
  @ApiProperty({
    description: 'Customer reaction details',
  })
  @ValidateNested()
  @IsInstance(CustomerReviewReactionDetailsDTO)
  @Type(() => CustomerReviewReactionDetailsDTO)
  customerReactionDetail?: CustomerReviewReactionDetailsDTO;
}

class RawFindByArtistIdsReviewDTO extends PickType(ReviewAvgDTO, [
  'artistId',
  'count',
  'detail',
  'value',
]) {}

export class RawFindByArtistIdsResponseDTO {
  @ApiProperty({
    description: 'contact',
  })
  @ValidateNested()
  @IsInstance(RawContactResponseDTO)
  @Type(() => RawContactResponseDTO)
  readonly contact: RawContactResponseDTO;

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

  @ApiProperty({
    description: 'reviews',
  })
  @ValidateNested()
  @IsInstance(RawFindByArtistIdsReviewsDTO)
  @Type(() => RawFindByArtistIdsReviewsDTO)
  reviews: RawFindByArtistIdsReviewsDTO[];

  @ApiProperty({
    description: 'review',
  })
  @ValidateNested()
  @IsInstance(RawFindByArtistIdsReviewsDTO)
  @Type(() => RawFindByArtistIdsReviewsDTO)
  review: RawFindByArtistIdsReviewDTO;

  @ApiProperty({
    description: 'recent works',
  })
  @ValidateNested()
  @IsInstance(RecentWorkDTO)
  @Type(() => RecentWorkDTO)
  recentWorks: RecentWorkDTO[];

  @ApiProperty({
    description: 'followers',
    example: 1,
  })
  @IsNumber()
  followers: number;

  @ApiProperty({
    description: 'is followed by user',
    example: true,
  })
  @IsNumber()
  isFollowedByUser: boolean;
}
