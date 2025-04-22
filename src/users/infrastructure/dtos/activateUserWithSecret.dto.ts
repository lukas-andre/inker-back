import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ActivateUserWithSecretReqDto {
  @ApiProperty({
    description: 'Secret key to activate the user',
    example: 'c31bd447-6054-4111-a881-7301e0b31ef3',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  secretKey: string;
} 