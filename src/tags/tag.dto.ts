import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TagDto {
  @ApiProperty({ description: 'Tag ID' })
  id: number;

  @ApiProperty({ description: 'Tag name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Created by' })
  @IsString()
  @IsOptional()
  createdBy?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Created by' })
  @IsString()
  @IsOptional()
  createdBy?: string;
}