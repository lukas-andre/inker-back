import { GenreInterface } from '../../genres/genre.interface';
import { BaseModelType } from '../../global/domain/models/base.model';
import { TagInterface } from '../../tags/tag.interface';
import { ContactInterface } from './contact.interface';

export type ArtistTypeProps =
  | 'id'
  | 'userId'
  | 'firstName'
  | 'lastName'
  | 'shortDescription'
  | 'profileThumbnail'
  | 'tags'
  | 'genders'
  | 'rating'
  | 'created_at'
  | 'updated_at';

export type ArtistType = {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  shortDescription?: string;
  profileThumbnail?: string;
  tags?: TagInterface[];
  genres?: GenreInterface[];
  contact?: ContactInterface;
  rating: number;
} & BaseModelType;
