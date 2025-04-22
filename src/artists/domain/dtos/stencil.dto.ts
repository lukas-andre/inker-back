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
  ValidateNested,
} from 'class-validator';
import { StencilStatus, StencilType } from '../stencilType';
import { TagDto } from '../../../tags/tag.dto';
import { Transform, Type } from 'class-transformer';
import { ToBoolean } from '../../../global/infrastructure/dtos/toBoolean';

// DTO para las dimensiones del stencil
export class StencilDimensionsDto {
  @ApiProperty({ description: 'Width in pixels or millimeters' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: 'Height in pixels or millimeters' })
  @IsNumber()
  height: number;
}

export class StencilDto implements StencilType {
  @ApiProperty({ description: 'Stencil ID' })
  id: string;

  @ApiProperty({ description: 'Artist ID' })
  @IsString()
  artistId: string;

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

  @ApiProperty({ description: 'Unique image identifier' })
  @IsString()
  imageId: string;

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
  @ToBoolean()
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
  @ToBoolean()
  isHidden: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp' })
  deletedAt?: Date;

  @ApiPropertyOptional({ description: 'Stencil tags', type: [TagDto] })
  tags?: TagDto[];

  @ApiPropertyOptional({ description: 'Stencil dimensions', type: StencilDimensionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StencilDimensionsDto)
  dimensions?: { width: number; height: number };

  @ApiPropertyOptional({ description: 'Recommended placement areas', type: 'string' })
  @IsString()
  @IsOptional()
  recommendedPlacements?: string;

  @ApiPropertyOptional({ description: 'Estimated time in minutes to complete', type: 'number' })
  @IsInt()
  @IsOptional()
  estimatedTime?: number;

  @ApiPropertyOptional({ description: 'Whether the stencil can be customized', default: false })
  @ToBoolean()
  @IsOptional()
  isCustomizable?: boolean;

  @ApiPropertyOptional({ description: 'Whether the stencil can be downloaded', default: false })
  @ToBoolean()
  @IsOptional()
  isDownloadable?: boolean;

  @ApiPropertyOptional({ description: 'License information' })
  @IsString()
  @IsOptional()
  license?: string;

  @ApiPropertyOptional({ description: 'URL to license details' })
  @IsString()
  @IsOptional()
  licenseUrl?: string;
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

  @ApiPropertyOptional({ description: 'Unique image identifier' })
  @IsString()
  @IsOptional()
  imageId?: string;

  @ApiProperty({ description: 'Image version', default: 1 })
  @IsInt()
  @IsOptional()
  imageVersion?: number;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Is featured item', default: 'false' })
  @IsOptional()
  isFeatured?: string | boolean;

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

  @ApiPropertyOptional({ description: 'Is stencil hidden', default: 'false' })
  @IsOptional()
  isHidden?: string | boolean;

  @ApiPropertyOptional({ description: 'Tag IDs', type: [String] })
  @IsOptional()
  tagIds?: string[] | string;

  @ApiPropertyOptional({ description: 'Stencil dimensions', type: StencilDimensionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StencilDimensionsDto)
  dimensions?: { width: number; height: number };

  @ApiPropertyOptional({ description: 'Recommended placement areas', type: 'string' })
  @IsString()
  @IsOptional()
  recommendedPlacements?: string;

  @ApiPropertyOptional({ description: 'Estimated time in minutes to complete', type: 'number' })
  @IsInt()
  @IsOptional()
  estimatedTime?: number;

  @ApiPropertyOptional({ description: 'Whether the stencil can be customized', default: false })
  @ToBoolean()
  @IsOptional()
  isCustomizable?: boolean;

  @ApiPropertyOptional({ description: 'Whether the stencil can be downloaded', default: false })
  @ToBoolean()
  @IsOptional()
  isDownloadable?: boolean;

  @ApiPropertyOptional({ description: 'License information' })
  @IsString()
  @IsOptional()
  license?: string;

  @ApiPropertyOptional({ description: 'URL to license details' })
  @IsString()
  @IsOptional()
  licenseUrl?: string;
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

  @ApiPropertyOptional({ description: 'Unique image identifier' })
  @IsString()
  @IsOptional()
  imageId?: string;

  @ApiPropertyOptional({ description: 'Image version' })
  @IsInt()
  @IsOptional()
  imageVersion?: number;

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
  @IsOptional()
  isHidden?: string | boolean;

  @ApiPropertyOptional({ description: 'Tag IDs', type: [String] })
  @IsOptional()
  tagIds?: string[] | string;

  @ApiPropertyOptional({ description: 'Stencil dimensions', type: StencilDimensionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StencilDimensionsDto)
  dimensions?: { width: number; height: number };

  @ApiPropertyOptional({ description: 'Recommended placement areas', type: 'string' })
  @IsString()
  @IsOptional()
  recommendedPlacements?: string;

  @ApiPropertyOptional({ description: 'Estimated time in minutes to complete', type: 'number' })
  @IsInt()
  @IsOptional()
  estimatedTime?: number;

  @ApiPropertyOptional({ description: 'Whether the stencil can be customized', default: false })
  @ToBoolean()
  @IsOptional()
  isCustomizable?: boolean;

  @ApiPropertyOptional({ description: 'Whether the stencil can be downloaded', default: false })
  @ToBoolean()
  @IsOptional()
  isDownloadable?: boolean;

  @ApiPropertyOptional({ description: 'License information' })
  @IsString()
  @IsOptional()
  license?: string;

  @ApiPropertyOptional({ description: 'URL to license details' })
  @IsString()
  @IsOptional()
  licenseUrl?: string;
}