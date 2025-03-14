import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StencilStatus, StencilType } from '../stencilType';
import { TagDto } from '../../../tags/tag.dto';

export class StencilDto implements StencilType {
  @ApiProperty({ description: 'Stencil ID' })
  id: number;

  @ApiProperty({ description: 'Artist ID' })
  @IsInt()
  @Min(1)
  artistId: number;

  @ApiProperty({ description: 'Stencil title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Stencil description' })
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

  @ApiPropertyOptional({ description: 'Stencil price' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ 
    description: 'Stencil status', 
    enum: StencilStatus,
    default: StencilStatus.AVAILABLE
  })
  @IsEnum(StencilStatus)
  status: StencilStatus;

  @ApiProperty({ description: 'Is stencil hidden', default: false })
  @IsBoolean()
  isHidden: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp' })
  deletedAt?: Date;

  @ApiPropertyOptional({ description: 'Stencil tags', type: [TagDto] })
  tags?: TagDto[];
}

export class CreateStencilDto {
  @ApiProperty({ description: 'Stencil title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Stencil description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Image version', default: 1 })
  @IsInt()
  @IsOptional()
  imageVersion?: number;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Is featured item', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Display order position', default: 0 })
  @IsInt()
  @IsOptional()
  orderPosition?: number;

  @ApiPropertyOptional({ description: 'Stencil price' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ 
    description: 'Stencil status', 
    enum: StencilStatus,
    default: StencilStatus.AVAILABLE
  })
  @IsEnum(StencilStatus)
  @IsOptional()
  status?: StencilStatus;

  @ApiPropertyOptional({ description: 'Is stencil hidden', default: false })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;

  @ApiPropertyOptional({ description: 'Tag IDs', type: [Number] })
  @IsInt({ each: true })
  @IsOptional()
  tagIds?: number[];
}

export class UpdateStencilDto {
  @ApiPropertyOptional({ description: 'Stencil title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Stencil description' })
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
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Display order position' })
  @IsInt()
  @IsOptional()
  orderPosition?: number;

  @ApiPropertyOptional({ description: 'Stencil price' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ 
    description: 'Stencil status', 
    enum: StencilStatus
  })
  @IsEnum(StencilStatus)
  @IsOptional()
  status?: StencilStatus;

  @ApiPropertyOptional({ description: 'Is stencil hidden' })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;

  @ApiPropertyOptional({ description: 'Tag IDs', type: [Number] })
  @IsInt({ each: true })
  @IsOptional()
  tagIds?: number[];
}