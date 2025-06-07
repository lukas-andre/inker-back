import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsEnum, IsOptional } from 'class-validator';
import { ConsentType } from '../../../agenda/domain/enum/consentType.enum';

export class UpdateFormTemplateDto {
  @ApiProperty({ description: 'Title of the consent form template', example: 'Tattoo Procedure Consent', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ description: 'JSON structure defining the form fields', example: { fields: [{ name: "clientName", type: "text", label: "Client Name" }] }, required: false })
  @IsOptional()
  @IsObject()
  @IsNotEmpty()
  content?: Record<string, any>;

  @ApiProperty({ description: 'Type of consent', enum: ConsentType, example: ConsentType.TATTOO_CONSENT, required: false })
  @IsOptional()
  @IsEnum(ConsentType)
  consentType?: ConsentType;
} 