import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BetaSignupRequestDto {
  @ApiProperty({
    description: 'Full name of the person signing up for beta',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Optional message from the user',
    example: 'I am excited to try out Inker!',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    description: 'Type of user',
    enum: ['artist', 'customer'],
    example: 'artist',
  })
  @IsIn(['artist', 'customer'])
  @IsNotEmpty()
  userType: 'artist' | 'customer';
}