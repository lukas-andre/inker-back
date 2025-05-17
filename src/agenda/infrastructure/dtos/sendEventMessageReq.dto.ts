import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendEventMessageReqDto {
  @ApiProperty({
    description: 'The content of the message.',
    example: 'Hello, can we discuss the upcoming event?',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
} 