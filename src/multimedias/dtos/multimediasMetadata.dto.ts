import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';

import { MultimediaMetadataDTO } from './multimediaMetadata.dto';

export class MultimediasMetadataDTO {
  @ApiProperty({
    description: 'Post multimedia count',
  })
  @IsNumber()
  count: number;

  @ApiProperty({
    description: 'Post multimedia metadata',
    type: MultimediaMetadataDTO,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => MultimediaMetadataDTO)
  metadata: MultimediaMetadataDTO[];
}
