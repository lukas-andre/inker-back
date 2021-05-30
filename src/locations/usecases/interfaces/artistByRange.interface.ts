export interface ArtistByRangeLocation {
  location_id: number;
  location_created_at: string;
  location_updated_at: string;
  location_address1: string;
  location_address2: string;
  location_address3: null;
  location_state: string;
  location_city: string;
  location_country: string;
  location_latitud: number;
  location_longitud: number;
  location_location: LocationLocation;
  location_artist_id: number;
  location_name: string;
  location_profile_thumbnail: null;
  distance: number;
  artist: any[];
}

// export interface Artist {
//   id: number;
//   created_at: Date;
//   updated_at: Date;
//   userId: number;
//   username: string;
//   firstName: string;
//   lastName: string;
//   contactEmail: string;
//   contactPhoneNumber: string;
//   shortDescription: string;
//   profileThumbnail: string;
//   tags: string;
//   genres: string;
//   rating: number;
// }

export interface LocationLocation {
  type: string;
  coordinates: number[];
}
