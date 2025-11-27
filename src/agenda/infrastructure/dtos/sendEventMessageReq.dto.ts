import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendEventMessageReqDto {
  @ApiProperty({
    description: 'The content of the message.',
    example: 'Hello, can we discuss the upcoming event?',
    maxLength: 1000,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  message: string;
}
