import { GenrerInterface } from '../../../genres/genre.interface';
import { TagInterface } from '../../../tags/tag.interface';

export class BaseArtistResponse {
  id?: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  shortDescription?: string;
  profileThumbnail?: string;
  tags?: TagInterface[] | string[];
  genres?: GenrerInterface[] | string[];
  followers?: number;
  follows?: number;
  rating?: number;
  created_at?: Date;
  updated_at?: Date;
}
