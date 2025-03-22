import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { WorkSource, WorkType } from '../workType';
import { TagDto } from '../../../tags/tag.dto';

export class WorkDto implements WorkType {
  @ApiProperty({ description: 'Work ID' })
  id: number;

  @ApiProperty({ description: 'Artist ID' })
  @IsInt()
  @Min(1)
  artistId: number;

  @ApiProperty({ description: 'Work title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Work description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({ description: 'Image version', default: 0 })
  @IsInt()
  imageVersion: number;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Thumbnail version', default: 0 })
  @IsInt()
  thumbnailVersion: number;

  @ApiProperty({ description: 'Is featured item', default: false })
  @IsBoolean()
  isFeatured: boolean;

  @ApiProperty({ description: 'Display order position', default: 0 })
  @IsInt()
  orderPosition: number;

  @ApiProperty({
    description: 'Source of the work (APP or EXTERNAL)',
    enum: WorkSource,
    default: WorkSource.EXTERNAL
  })
  @IsEnum(WorkSource)
  source: WorkSource;

  @ApiProperty({ description: 'Is work hidden', default: false })
  @IsBoolean()
  isHidden: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp' })
  deletedAt?: Date;

  @ApiPropertyOptional({ description: 'Work tags', type: [TagDto] })
  tags?: TagDto[];
}

export class CreateWorkDto {
  @ApiProperty({ description: 'Work title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Work description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Image ID' })
  @IsString()
  @IsOptional()
  imageId?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Image version', default: 0 })
  @IsInt()
  @IsOptional()
  imageVersion?: number;

  @ApiProperty({ description: 'Thumbnail version', default: 0 })
  @IsInt()
  @IsOptional()
  thumbnailVersion?: number;

  @ApiProperty({ description: 'Is featured item', default: false })
  @IsOptional()
  isFeatured?: string | boolean;

  @ApiProperty({ description: 'Display order position', default: 0 })
  @IsInt()
  @IsOptional()
  orderPosition?: number;

  @ApiProperty({
    description: 'Source of the work (APP or EXTERNAL)',
    enum: WorkSource,
    default: WorkSource.EXTERNAL
  })
  @IsEnum(WorkSource)
  @IsOptional()
  source?: WorkSource;

  @ApiProperty({ description: 'Is work hidden', default: false })
  @IsOptional()
  isHidden?: string | boolean;

  @ApiPropertyOptional({ description: 'Tag IDs', type: [Number] })
  @IsOptional()
  tagIds?: number[] | string;
}

export class UpdateWorkDto {
  @ApiPropertyOptional({ description: 'Work title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Work description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Is featured item' })
  @IsOptional()
  isFeatured?: string | boolean;

  @ApiPropertyOptional({ description: 'Display order position' })
  @IsInt()
  @IsOptional()
  orderPosition?: number;

  @ApiPropertyOptional({
    description: 'Source of the work (APP or EXTERNAL)',
    enum: WorkSource
  })
  @IsEnum(WorkSource)
  @IsOptional()
  source?: WorkSource;

  @ApiPropertyOptional({ description: 'Is work hidden' })
  @IsOptional()
  isHidden?: string | boolean;

  @ApiPropertyOptional({ description: 'Tag IDs', type: [Number] })
  @IsOptional()
  tagIds?: number[] | string;
}