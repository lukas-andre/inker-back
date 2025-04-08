import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInstance, IsNumber, IsOptional, IsString } from 'class-validator';

import { BaseDTO } from '../../../global/domain/dtos/base.dto';
import { MetaTagsDto } from '../../../global/domain/dtos/metaTags.dto';
import { ArtistType } from '../artistType';

import { ContactDto } from './contact.dto';

export class ArtistDto extends BaseDTO implements ArtistType {
  @ApiProperty({
    description: 'User id',
    required: true,
    type: String,
    example: '1',
  })
  @IsString()
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Artist username',
    required: true,
    type: String,
    example: 'noname_eter',
  })
  @IsString()
  @Expose()
  username: string;

  @ApiProperty({
    description: 'Artist first name',
    required: true,
    type: String,
    example: 'Lucas',
  })
  @IsString()
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Artist last name',
    required: true,
    type: String,
    example: 'Henry',
  })
  @IsString()
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Artist short description',
    required: false,
    type: String,
    example: 'Artist short description',
  })
  @IsString()
  @IsOptional()
  @Expose()
  shortDescription?: string;

  @ApiProperty({
    description: 'Artist profile thumbnail',
    required: false,
    type: String,
    example: 'www.example.com/artist/profile/thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  @Expose()
  profileThumbnail?: string;

  @ApiProperty({
    description: 'Artist tags',
    required: false,
    type: [MetaTagsDto],
    example: [
      {
        id: '1',
        name: 'simpleTag',
      } as MetaTagsDto,
    ],
  })
  @IsOptional()
  @IsInstance(MetaTagsDto)
  @Type(() => MetaTagsDto)
  @Expose()
  tags?: MetaTagsDto[];

  @ApiProperty({
    description: 'Artist genres',
    required: false,
    type: [MetaTagsDto],
    example: [{ id: '1', name: 'simpleTag' } as MetaTagsDto],
  })
  @IsOptional()
  @IsInstance(MetaTagsDto)
  @Type(() => MetaTagsDto)
  @Expose()
  genres?: MetaTagsDto[];

  @ApiProperty({
    description: 'Artist studio photo',
    required: false,
    type: String,
    example: 'www.example.com/artist/studio/thumbnail.jpg',
  })
  @IsString()
  @IsOptional()
  @Expose()
  studioPhoto?: string;

  @ApiProperty({
    description: 'Artist contacts',
    required: false,
    type: ContactDto,
    example: {
      id: '1',
      email: 'example@email.cl',
      phone: '+56954484712',
      phoneCountryIsoCode: 'CL',
      phoneDialCode: '+56',
    } as ContactDto,
  })
  @IsOptional()
  @IsInstance(ContactDto)
  @Type(() => ContactDto)
  @Expose()
  contact?: ContactDto;

  @ApiProperty({
    description: 'Artist rating',
    required: true,
    type: Number,
    example: 5,
  })
  @IsNumber()
  @Expose()
  rating: number;
}
