import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';
import { MultimediaMetadaDto } from './multimediaMetadata.dto';

export class MultimediasMetadataDto {
  @ApiProperty({
    description: 'Post multimedia count',
  })
  @IsNumber()
  count: number;

  @ApiProperty({
    description: 'Post multimedia metadata',
    type: MultimediaMetadaDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => MultimediaMetadaDto)
  metadata: MultimediaMetadaDto[];
}
