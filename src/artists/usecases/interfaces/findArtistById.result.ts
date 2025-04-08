import { ReviewAvgByArtistIdsResult } from '../../../reviews/database/repositories/reviewAvg.repository';

export interface FindArtistByIdResult {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  profileThumbnail?: string;
  studioPhoto?: string;
  shortDescription?: string;
  followers?: number;
  follows?: number;
  review?: ReviewAvgByArtistIdsResult;
  isFollowedByUser?: boolean;
  worksCount?: number;
  visibleWorksCount?: number;
  stencilsCount?: number;
  visibleStencilsCount?: number;
}
