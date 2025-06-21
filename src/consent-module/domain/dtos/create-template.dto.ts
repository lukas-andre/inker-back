import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ConsentType } from '../../../agenda/domain/enum/consentType.enum';
import {
  FormSchema,
  FormSchemaField,
  FormSchemaLogic,
} from '../../../agenda/infrastructure/entities/formTemplate.entity'; // Re-using the interface

// More detailed validation for FormSchema sub-properties if needed
class FormSchemaFieldDto implements FormSchemaField {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  options?: string[] | Record<string, any>[];

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  defaultValue?: any;

  @IsOptional()
  @IsObject()
  validation?: Record<string, any>;
}

class FormSchemaLogicDto implements FormSchemaLogic {
  @IsOptional()
  @ValidateNested()
  @Type(() => FormSchemaLogicConditionDto)
  showIf?: FormSchemaLogicConditionDto;
}

class FormSchemaLogicConditionDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsNotEmpty()
  condition: string;

  @IsOptional()
  value?: any;
}

class FormSchemaDto implements FormSchema {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormSchemaFieldDto)
  fields: FormSchemaFieldDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FormSchemaLogicDto)
  logic?: FormSchemaLogicDto;
}

export class CreateConsentTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  @ValidateNested()
  @Type(() => FormSchemaDto)
  schema: FormSchemaDto;

  @IsEnum(ConsentType)
  @IsNotEmpty()
  consentType: ConsentType;

  // artistId will be injected from the authenticated user context (e.g., JWT payload)
}
