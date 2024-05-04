import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { MetaTagDto } from '../../../global/infrastructure/dtos/metaTag.dto';
import { MultimediasMetadataDTO } from '../../../multimedias/dtos/multimediasMetadata.dto';

export class ArtistPostResponseDto {
  @ApiProperty({
    description: 'Post id',
  })
  @IsNumber()
  readonly id: number;

  @ApiProperty({
    description: 'Post content',
  })
  @IsString()
  readonly content: string;

  @ApiProperty({
    description: 'Post location',
  })
  @IsString()
  readonly location: string;

  @ApiProperty({
    description: 'Post user Id',
  })
  @IsString()
  readonly userId: number;

  @ApiProperty({
    description: 'Post user type id',
  })
  @IsString()
  readonly userTypeId: number;

  @ApiProperty({
    description: 'Post user type',
  })
  @IsString()
  readonly userType: string;

  @ApiProperty({
    description: 'Post user username',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: 'Post user profileThumbnail',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  readonly profileThumbnail: string;

  @ApiProperty({
    description: 'Post user profileThumbnail',
    type: MultimediasMetadataDTO,
  })
  @Type(() => MultimediasMetadataDTO)
  readonly multimedia: MultimediasMetadataDTO;

  @ApiProperty({
    description: 'Post tags',
    type: MetaTagDto,
    isArray: true,
  })
  @Type(() => MetaTagDto)
  @Transform(value => (value ? value : { name: '' }))
  readonly tags: MetaTagDto[];

  @ApiProperty({
    description: 'Post genders',
    type: MetaTagDto,
    isArray: true,
  })
  @Type(() => MetaTagDto)
  @Transform(value => (value ? value : { name: '' }))
  readonly genres: MetaTagDto[];
}
