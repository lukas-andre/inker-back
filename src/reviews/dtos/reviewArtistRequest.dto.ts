import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { RatingRate } from '../database/entities/reviewAvg.entity';

export class ReviewArtistRequestDto {
  @ApiProperty({
    type: Number,
    description: 'The rating of the artist',
    // minimum: 1,
    // maximum: 5,
    required: true,
    enum: RatingRate,
    enumName: 'RatingRate',
    example: RatingRate.FOUR,
  })
  // @IsNumber()
  // @IsPositive()
  @IsEnum(RatingRate)
  readonly rating: RatingRate;

  @ApiProperty({
    type: String,
    description: 'The comment of the artist',
    required: false,
    example: 'This artist is awesome',
  })
  @IsString()
  @IsOptional()
  readonly comment: string;

  @ApiProperty({
    type: String,
    description: 'The name of the reviewer',
    required: true,
    example: 'John Doe',
  })
  @IsString()
  readonly displayName: string;

  // @ApiProperty({
  //   type: Number,
  //   description: 'User ID that made the review',
  //   required: true,
  //   example: 1,
  // })
  // @IsNumber()
  // readonly createdBy: number;

  @ApiProperty({
    type: String,
    description: 'Headline of the review',
    required: false,
    example: 'This artist is awesome',
  })
  @IsString()
  @IsOptional()
  readonly header: string;
}
