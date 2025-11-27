import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ContactRequestDto {
  @ApiProperty({
    description: 'Full name of the person contacting',
    example: 'María González',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email address',
    example: 'maria.gonzalez@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Subject of the message',
    example: 'Sugerencia para mejorar la app',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'The message content',
    example: 'Me encantaría que pudieran agregar una función de...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiProperty({
    description: 'Type of user sending the message',
    enum: ['artist', 'customer', 'other'],
    example: 'artist',
  })
  @IsIn(['artist', 'customer', 'other'])
  @IsNotEmpty()
  userType: 'artist' | 'customer' | 'other';

  @ApiProperty({
    description: 'Type of message being sent',
    enum: ['suggestion', 'bug_report', 'general_inquiry', 'feature_request', 'other'],
    example: 'suggestion',
  })
  @IsIn(['suggestion', 'bug_report', 'general_inquiry', 'feature_request', 'other'])
  @IsNotEmpty()
  messageType: 'suggestion' | 'bug_report' | 'general_inquiry' | 'feature_request' | 'other';
}