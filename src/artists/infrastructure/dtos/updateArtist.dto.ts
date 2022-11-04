import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateArtistDto } from './createArtist.dto';

export class UpdateArtistDto extends PartialType(
  OmitType(CreateArtistDto, ['userId', 'phoneNumber'] as const),
) {
  @ApiProperty({
    example: 'This is my inker studio, welcome',
    description: 'description for artist studio profile',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly shortDescription: string;

  @ApiProperty({
    example: '+56974448339',
    description: 'Artist Contact Number',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly contactPhoneNumber: string;
}
