import { ArtistType } from '../../domain/artistType';
import { ReviewAvgByArtistIdsResult } from '../../../reviews/database/providers/reviewAvg.provider';

export interface FindArtistByIdResult {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  profileThumbnail?: string;
  studioPhoto?: string;
  shortDescription?: string;
  // Contadores y relaciones
  followers?: number;
  follows?: number;
  // Nuevas propiedades
  review?: ReviewAvgByArtistIdsResult;
  isFollowedByUser?: boolean;
  // Contadores de trabajos
  worksCount?: number;
  visibleWorksCount?: number;
  // Contadores de stencils
  stencilsCount?: number;
  visibleStencilsCount?: number;
}
