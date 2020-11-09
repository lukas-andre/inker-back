import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateArtistDto {
  @ApiProperty({
    example: '415604a6-6db4-4a3b-a1dc-470193485b91',
    description: 'User Id',
  })
  @IsString()
  readonly userId: string;

  @ApiProperty({
    example: 'Lucas',
    description: 'First Name',
  })
  @IsString()
  readonly firstName: string;

  @ApiProperty({
    example: 'Henry',
    description: 'Last Name',
  })
  @IsString()
  readonly lastName: string;

  @ApiProperty({
    example: 'test@inker.cl',
    description: 'Customer contact email',
  })
  @IsString()
  readonly contactEmail?: string;

  @ApiProperty({
    example: '+56964484712',
    description: 'Customer phone numer',
  })
  @IsString()
  readonly phoneNumber?: string;
}
