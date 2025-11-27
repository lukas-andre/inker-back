import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsPositive, IsOptional, MinLength } from 'class-validator';
import { UserType } from '../../../users/domain/enums/userType.enum';

export class AdminGrantTokensDto {
  @ApiProperty({ 
    description: 'User ID to grant tokens to',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @IsString()
  userId: string;

  @ApiProperty({ 
    description: 'User type',
    enum: UserType,
    example: UserType.CUSTOMER
  })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({ 
    description: 'User type specific ID (customer or artist ID)',
    example: '123e4567-e89b-12d3-a456-426614174001' 
  })
  @IsString()
  userTypeId: string;

  @ApiProperty({ 
    description: 'Number of tokens to grant',
    example: 50,
    minimum: 1
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ 
    description: 'Reason for granting tokens',
    example: 'Manual grant - Customer support compensation',
    minLength: 5
  })
  @IsString()
  @MinLength(5)
  reason: string;

  @ApiProperty({ 
    description: 'Admin user ID who is granting the tokens',
    example: 'admin-123',
    required: false
  })
  @IsString()
  @IsOptional()
  adminUserId?: string;
}