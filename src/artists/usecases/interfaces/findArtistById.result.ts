import { ArtistType } from '../../domain/artistType';

export type FindArtistByIdResult = ArtistType & {
  follows: number;
  followers: number;
};
