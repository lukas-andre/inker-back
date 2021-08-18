import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';

export class ListAllArtistPostsQueryDto {
  @ApiProperty({
    description: 'Post genres',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Transform((value) => (Array.isArray(value) ? value : value ? [value] : []))
  readonly genres: string[];

  @ApiProperty({
    description: 'Post Tags',
  })
  @IsArray()
  @IsOptional()
  @Transform((value) => (Array.isArray(value) ? value : value ? [value] : []))
  readonly tags: string[];
}
