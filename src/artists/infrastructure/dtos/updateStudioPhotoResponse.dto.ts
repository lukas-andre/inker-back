import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInstance,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateStudioPhotoDataDto {
  @ApiProperty({
    description: 'Studio photo cloud front url ',
    example: 'https://d1z5skrvc8vebc.cloudfront.net/studio/photo/1/1.jpg',
  })
  @IsString()
  cloudFrontUrl: string;

  @ApiProperty({
    description: 'Artist id',
    required: true,
    type: String,
    example: '1',
  })
  @IsString()
  id: string;
}

export class UpdateStudioPhotoResponseDto {
  @ApiProperty({
    description: 'Studio photo status',
    example: 'ok',
  })
  readonly status: string;

  @ApiProperty({
    type: UpdateStudioPhotoDataDto,
  })
  @ValidateNested()
  @IsInstance(UpdateStudioPhotoDataDto)
  @Type(() => UpdateStudioPhotoDataDto)
  readonly data: UpdateStudioPhotoDataDto;
}
