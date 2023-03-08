import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class MultimediaMetadataDTO {
  @ApiProperty({
    description: 'multimedia url',
  })
  @IsString()
  url?: string;

  @ApiProperty({
    description: 'multimedia size',
  })
  @IsNumber()
  size?: number;

  @ApiProperty({
    description: 'multimedia type',
  })
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'multimedia encoding',
  })
  @IsString()
  encoding?: string;

  @ApiProperty({
    description: 'multimedia position',
  })
  @IsNumber()
  position?: number;

  @ApiProperty({
    description: 'multimedia fieldname',
  })
  @IsString()
  fieldname?: string;

  @ApiProperty({
    description: 'multimedia originalname',
  })
  @IsString()
  originalname?: string;
}
