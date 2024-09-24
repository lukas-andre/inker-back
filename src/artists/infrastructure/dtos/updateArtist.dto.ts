import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

class UpdateContactDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email de contacto del artista',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  readonly email?: string;
}

export class UpdateArtistDto {
  @ApiProperty({
    example: 'John',
    description: 'Nombre del artista',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Apellido del artista',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lastName?: string;

  @ApiProperty({
    example: 'This is my inker studio, welcome',
    description: 'Descripción para el perfil del estudio del artista',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly shortDescription?: string;

  @ApiProperty({ type: UpdateContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContactDto)
  readonly contact?: UpdateContactDto;
}
