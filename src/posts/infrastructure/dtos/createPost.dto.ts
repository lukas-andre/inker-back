import { Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

@Entity()
export class CreatePostDto {
  @ApiProperty({
    description: 'Post Content',
  })
  @IsString()
  readonly content: string;

  @ApiProperty({
    description: 'Post user location',
  })
  @IsString()
  readonly location: string;

  @ApiProperty({
    description: 'Post user profile thumnail',
  })
  @IsString()
  readonly profileThumbnail: string;

  @ApiProperty({
    description: 'Post tags',
  })
  @IsArray()
  readonly tags: string[];

  @ApiProperty({
    description: 'Post genders',
  })
  @IsArray()
  readonly genders: string[];
}
