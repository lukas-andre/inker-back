import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ContentType } from '../enums/content-types.enum';
import { ViewSource } from '../enums/interaction-types.enum';

export class RecordInteractionDto {
  @ApiProperty({ description: 'Content ID', type: String })
  @IsString()
  contentId: string;

  @ApiProperty({ description: 'Content type', enum: ContentType })
  @IsEnum(ContentType)
  @IsNotEmpty()
  contentType: ContentType;

  @ApiProperty({
    description: 'Interaction type',
    enum: ['view', 'like', 'viewDuration', 'conversion', 'impression'],
  })
  @IsNotEmpty()
  interactionType:
    | 'view'
    | 'like'
    | 'viewDuration'
    | 'conversion'
    | 'impression';

  @ApiPropertyOptional({ description: 'View source', enum: ViewSource })
  @IsEnum(ViewSource)
  @IsOptional()
  viewSource?: ViewSource;

  @ApiPropertyOptional({
    description: 'View duration in seconds',
    type: Number,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;
}

export class RecordArtistViewDto {
  @ApiProperty({ description: 'Artist ID', type: String })
  @IsString()
  artistId: string;
}

export class ContentMetricsDto {
  @ApiProperty({ description: 'Content ID', type: String })
  @IsString()
  contentId: string;

  @ApiProperty({ description: 'Content type', enum: ContentType })
  contentType: ContentType;

  @ApiProperty({ description: 'View count', type: Number })
  viewCount: number;

  @ApiProperty({ description: 'Unique view count', type: Number })
  uniqueViewCount: number;

  @ApiProperty({ description: 'Like count', type: Number })
  likeCount: number;

  @ApiPropertyOptional({
    description: 'User has liked this content',
    type: Boolean,
  })
  userHasLiked?: boolean;

  @ApiPropertyOptional({ description: 'View duration metrics' })
  viewDuration?: {
    totalSeconds: number;
    averageSeconds: number;
  };

  @ApiPropertyOptional({ description: 'Engagement rate', type: Number })
  engagementRate?: number;

  @ApiPropertyOptional({ description: 'Conversion metrics' })
  conversions?: {
    count: number;
    conversionRate: number;
  };

  @ApiPropertyOptional({ description: 'Impression metrics' })
  impressions?: {
    count: number;
    ctr: number;
  };

  @ApiPropertyOptional({ description: 'View source metrics' })
  viewSources?: {
    search?: number;
    feed?: number;
    profile?: number;
    related?: number;
    direct?: number;
  };
}

export class ArtistMetricsDto {
  @ApiProperty({ description: 'Artist ID', type: String })
  artistId: string;

  @ApiProperty({ description: 'View count', type: Number })
  viewCount: number;

  @ApiProperty({ description: 'Unique view count', type: Number })
  uniqueViewCount: number;

  @ApiPropertyOptional({ description: 'Follower metrics' })
  followers?: {
    count: number;
    fromContentViews?: number;
    conversionRate?: number;
  };
}

export class BatchMetricsQueryDto {
  @ApiProperty({ description: 'Content IDs', type: [String] })
  @IsNotEmpty()
  contentIds: string[];

  @ApiProperty({ description: 'Content type', enum: ContentType })
  @IsEnum(ContentType)
  @IsNotEmpty()
  contentType: ContentType;
}
