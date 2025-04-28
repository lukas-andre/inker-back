import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateTattooFavoriteDto {
  @ApiProperty({
    description: 'ID of the tattoo design to update',
    example: '77da2d99-a6d3-44d9-b8c0-ae9fb06b6200',
  })
  @IsUUID()
  @IsNotEmpty()
  designId: string;

  @ApiProperty({
    description: 'New favorite status for the design',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isFavorite: boolean;
} 