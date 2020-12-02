import { Artist } from '../entities/artist.entity';
import { Follower } from '../entities/follower.entity';
import { Gender } from '../entities/genders.entity';
import { Tag } from '../entities/tag.entity';

export class BaseArtistResponse {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  shortDescription?: string;
  profileThumbnail?: string;
  tags?: Tag[] | string[];
  genders?: Gender[] | string[];
  followers?: number;
  rating?: number;
  created_at?: Date;
  updated_at?: Date;
}
