import { ApiProperty } from '@nestjs/swagger';

import { ConsentType } from '../../../agenda/domain/enum/consentType.enum';

export class FormTemplateDto {
  @ApiProperty({
    description: 'Unique identifier of the form template',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the consent form template',
    example: 'Tattoo Procedure Consent',
  })
  title: string;

  @ApiProperty({ description: 'JSON structure defining the form fields' })
  content: Record<string, any>;

  @ApiProperty({ description: 'Version of the form template', example: 1 })
  version: number;

  @ApiProperty({
    description: 'Type of consent',
    enum: ConsentType,
    example: ConsentType.TATTOO_CONSENT,
  })
  consentType: ConsentType;

  @ApiProperty({
    description: 'Artist ID associated with the template',
    example: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
  })
  artistId: string;

  @ApiProperty({
    description: 'Indicates if the template is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-02T12:00:00.000Z',
  })
  updatedAt: Date;
}
