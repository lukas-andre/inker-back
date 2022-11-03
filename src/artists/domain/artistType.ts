import { GenreInterface } from '../../genres/genre.interface';
import { BaseModelType } from '../../global/domain/models/base.model';
import { TagInterface } from '../../tags/tag.interface';
import { ContactInterface } from './interfaces/contact.interface';

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
  studioPhoto?: string;
  rating: number;
} & BaseModelType;
