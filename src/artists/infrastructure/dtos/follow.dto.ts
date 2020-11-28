import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FollowerDto {
  @ApiProperty({
    example: '415604a6-6db4-4a3b-a1dc-470193485b91',
    description: 'Customer Id',
  })
  @IsString()
  readonly customerId: string;

  @ApiProperty({
    example: 'lucas@gmail.com',
    description: 'User identifier',
  })
  @IsString()
  readonly identifier: string;

  @ApiProperty({
    example:
      'http://d2e2zqk24pso8s.cloudfront.net/artist/34dd0b7f-0846-4c31-9d83-8ea513e8a3fa/profile-picture_Sun',
    description: 'cloudfront url',
  })
  @IsString()
  readonly profileThumbnail: string;
}
