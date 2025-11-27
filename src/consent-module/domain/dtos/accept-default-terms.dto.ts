import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AcceptDefaultTermsDto {
  @ApiProperty({
    description: 'Event ID for which the default terms are being accepted',
    example: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'Digital signature (can be typed name or base64 image)',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  digitalSignature: string;
}
