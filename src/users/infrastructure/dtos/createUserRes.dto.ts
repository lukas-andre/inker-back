import { OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { ArtistDto } from '../../../artists/domain/dtos/artist.dto';
import { ContactDto } from '../../../artists/domain/dtos/contact.dto';
import { CustomerDto } from '../../../customers/domain/dtos/customer.dto';

class ContactProps extends OmitType(ContactDto, [
  'updatedAt',
  'createdAt',
] as const) {}

export class CreateArtistUserResDto extends OmitType(ArtistDto, [
  'updatedAt',
  'createdAt',
  'contact',
] as const) {
  @Expose()
  @Type(() => ContactProps)
  contact: ContactProps;
}

export class CreateCustomerUserResDto extends OmitType(CustomerDto, [
  'rating',
  'profileThumbnail',
  'shortDescription',
  'follows',
  'updatedAt',
] as const) {}
