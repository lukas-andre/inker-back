import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { ConsentType } from '../../../agenda/domain/enum/consentType.enum';

export class CreateFormTemplateDto {
  @ApiProperty({
    description: 'Title of the consent form template',
    example: 'Tattoo Procedure Consent',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'JSON structure defining the form fields',
    example: {
      fields: [{ name: 'clientName', type: 'text', label: 'Client Name' }],
    },
  })
  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;

  @ApiProperty({
    description: 'Version of the form template',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number = 1;

  @ApiProperty({
    description: 'Type of consent',
    enum: ConsentType,
    example: ConsentType.TATTOO_CONSENT,
  })
  @IsEnum(ConsentType)
  @IsNotEmpty()
  consentType: ConsentType;

  @ApiProperty({
    description: 'Artist ID to associate the template with',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  artistId: string;
}
