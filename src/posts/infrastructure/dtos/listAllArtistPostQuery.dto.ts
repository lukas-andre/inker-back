import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListAllArtistPostsQueryDto {
  @ApiProperty({
    description: 'Post genres',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Transform(value => (Array.isArray(value) ? value : value ? [value] : []))
  readonly genres: string[];

  @ApiProperty({
    description: 'Post Tags',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Transform(value => (Array.isArray(value) ? value : value ? [value] : []))
  readonly tags: string[];
}
