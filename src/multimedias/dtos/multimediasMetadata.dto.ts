import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';
import { MultimediaMetadataDto } from './multimediaMetadata.dto';

export class MultimediasMetadataDto {
  @ApiProperty({
    description: 'Post multimedia count',
  })
  @IsNumber()
  count: number;

  @ApiProperty({
    description: 'Post multimedia metadata',
    type: MultimediaMetadataDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => MultimediaMetadataDto)
  metadata: MultimediaMetadataDto[];
}
