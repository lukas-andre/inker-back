import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

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
    description: 'Post tags',
  })
  @IsOptional()
  @IsArray()
  readonly tags?: string[];

  @ApiProperty({
    description: 'Post genders',
  })
  @IsOptional()
  @IsArray()
  readonly genders?: string[];
}
