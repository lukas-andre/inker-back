import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({
    example: 'John',
    description: 'Customer first name',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Customer last name',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lastName?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Customer contact email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  readonly contactEmail?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Customer contact phone number',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  readonly contactPhoneNumber?: string;

  @ApiProperty({
    example: 'Regular customer interested in tattoos',
    description: 'Short description about the customer',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly shortDescription?: string;
}
