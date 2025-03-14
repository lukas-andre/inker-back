import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ArtistStyleType } from '../artistStyleType';

export class ArtistStyleDto implements ArtistStyleType {
  @ApiProperty({ description: 'Artist ID' })
  @IsInt()
  @Min(1)
  artistId: number;

  @ApiProperty({ description: 'Style name' })
  @IsString()
  @IsNotEmpty()
  styleName: string;

  @ApiProperty({ description: 'Proficiency level (1-5)', default: 3 })
  @IsInt()
  @Min(1)
  @Max(5)
  proficiencyLevel: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class CreateArtistStyleDto {
  @ApiProperty({ description: 'Style name' })
  @IsString()
  @IsNotEmpty()
  styleName: string;

  @ApiProperty({ description: 'Proficiency level (1-5)', default: 3 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  proficiencyLevel?: number;
}

export class UpdateArtistStyleDto {
  @ApiPropertyOptional({ description: 'Proficiency level (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  proficiencyLevel: number;
}