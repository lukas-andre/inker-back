import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

import { RatingRate } from '../interfaces/reviewAvg.interface';

export class ReviewArtistRequestDto {
  @ApiProperty({
    type: Number,
    description: 'The rating of the artist',
    required: false,
    enum: RatingRate,
    enumName: 'RatingRate',
    example: RatingRate.FOUR,
  })
  @ValidateIf(
    (o: ReviewArtistRequestDto) =>
      (o.comment && o.comment.length > 0) || (o.header && o.header.length > 0),
  )
  @IsEnum(RatingRate)
  readonly rating?: RatingRate;

  @ApiProperty({
    type: String,
    description: 'The comment of the artist',
    required: false,
    example: 'This artist is awesome',
  })
  @IsString()
  @IsOptional()
  readonly comment?: string;

  @ApiProperty({
    type: String,
    description: 'The name of the reviewer',
    required: true,
    example: 'John Doe',
  })
  @IsString()
  readonly displayName: string;

  @ApiProperty({
    type: String,
    description: 'Headline of the review',
    required: false,
    example: 'This artist is awesome',
  })
  @IsString()
  @IsOptional()
  readonly header?: string;
}
