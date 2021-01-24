import { GenrerInterface } from '../../genres/genre.interface';
import { TagInterface } from '../../tags/tag.interface';

export type ArtistTypeProps =
  | 'id'
  | 'userId'
  | 'firstName'
  | 'lastName'
  | 'contactEmail'
  | 'contactPhoneNumber'
  | 'shortDescription'
  | 'profileThumbnail'
  | 'tags'
  | 'genders'
  | 'rating'
  | 'followers'
  | 'follows'
  | 'created_at'
  | 'updated_at';

export type ArtistType = {
  id?: number;
  username?: string;
  userId?: number;
  userTypeId?: number;
  firstName?: string;
  lastName?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  shortDescription?: string;
  profileThumbnail?: string;
  tags?: string[] | TagInterface[];
  genres?: string[] | GenrerInterface[];
  rating?: number;
  followers?: number;
  follows?: number;
  created_at?: Date;
  updated_at?: Date;
};
