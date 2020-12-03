import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FollowerDto {
  @ApiProperty({
    example: '41560',
    description: 'User Id',
  })
  @IsString()
  userId: number;

  @ApiProperty({
    example: '415604',
    description: 'UserType Id, artist or customer Id',
  })
  @IsString()
  readonly userTypeId: number;

  @ApiProperty({
    example: 'lucas@gmail.com',
    description: 'User identifier',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    example:
      'http://d2e2zqk24pso8s.cloudfront.net/artist/34dd0b7f-0846-4c31-9d83-8ea513e8a3fa/profile-picture_Sun',
    description: 'cloudfront url',
  })
  @IsString()
  readonly profileThumbnail: string;
}
