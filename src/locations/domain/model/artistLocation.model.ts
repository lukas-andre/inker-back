import { LocationModel } from './location.model';

export interface ArtistLocationModel extends LocationModel {
  artistId: string;
  name: string;
  profileThumbnail?: string;
  googlePlaceId?: string;
}
