import { LocationModel } from './location.model';

export interface ArtistLocationModel extends LocationModel {
  artistId: number;
  name: string;
  profileThumbnail?: string;
  googlePlaceId?: string;
}
