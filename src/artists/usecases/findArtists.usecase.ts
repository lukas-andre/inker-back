import { Injectable } from '@nestjs/common';

import { FollowedsRepository } from '../../follows/infrastructure/database/followeds.repository';
import { FollowingsRepository } from '../../follows/infrastructure/database/followings.repository';
import { ReviewAvgRepository } from '../../reviews/database/repositories/reviewAvg.repository';
import { SearchArtistDto } from '../infrastructure/dtos/searchArtist.dto';
import { ArtistRepository } from '../infrastructure/repositories/artist.repository';

import { FindArtistOptions } from './findArtist.usecases';

@Injectable()
export class FindArtistsUsecase {
  constructor(
    private readonly artistProvider: ArtistRepository,
    private readonly followedsProvider: FollowedsRepository,
    private readonly followingProvider: FollowingsRepository,
    private readonly reviewAvgProvider: ReviewAvgRepository,
  ) {}

  async execute(searchParams: SearchArtistDto, options?: FindArtistOptions) {
    const result = await this.artistProvider.searchArtists(searchParams);

    // Si no hay opciones de include, procesamos solo followers y follows como antes
    if (!options) {
      const artistsWithFollowersAndFollowings = await Promise.all(
        result.artists.map(async artist => {
          const [followers, follows] = await Promise.all([
            this.followedsProvider.countFollowers(artist.userId),
            this.followingProvider.countFollows(artist.userId),
          ]);

          return {
            ...artist,
            followers,
            follows,
          };
        }),
      );

      return {
        artists: artistsWithFollowersAndFollowings,
        meta: result.meta,
      };
    }

    // Si hay opciones de include, procesamos cada artista con toda la información solicitada
    const artistIds = result.artists.map(artist => artist.id);

    // Obtener datos en bloque cuando sea posible para reducir consultas a la BD
    const [reviewsData, userFollowsData] = await Promise.all([
      options.includeRatings
        ? this.reviewAvgProvider.findAvgByArtistIds(artistIds)
        : Promise.resolve([]),
      options.includeUserFollow && options.currentUserId
        ? this.followingProvider.userFollowsArtists(
            options.currentUserId,
            artistIds,
          )
        : Promise.resolve(new Map()),
    ]);

    // Crear mapas para acceso más eficiente
    const reviewsByArtistId = new Map(
      reviewsData.map(review => [review.artistId, review]),
    );

    const enrichedArtists = await Promise.all(
      result.artists.map(async artist => {
        // Datos básicos
        const enrichedArtist: any = { ...artist };

        // Procesar follows y followers si se solicitan
        if (options.includeFollows) {
          const [followers, follows] = await Promise.all([
            this.followedsProvider.countFollowers(artist.userId),
            this.followingProvider.countFollows(artist.userId),
          ]);

          enrichedArtist.followers = followers;
          enrichedArtist.follows = follows;
        }

        // Añadir ratings si se solicitan
        if (options.includeRatings) {
          enrichedArtist.review = reviewsByArtistId.get(artist.id) || {
            artistId: artist.id,
            avgRating: 0,
            count: 0,
          };
        }

        // Añadir si el usuario actual sigue al artista
        if (options.includeUserFollow && options.currentUserId) {
          enrichedArtist.isFollowedByUser =
            userFollowsData.get(artist.id) || false;
        }

        // Incluir contadores de trabajos y stencils
        if (options.includeWorkCounts) {
          enrichedArtist.worksCount = artist.worksCount || 0;
          enrichedArtist.visibleWorksCount = artist.visibleWorksCount || 0;
        }

        if (options.includeStencilCounts) {
          enrichedArtist.stencilsCount = artist.stencilsCount || 0;
          enrichedArtist.visibleStencilsCount =
            artist.visibleStencilsCount || 0;
        }

        return enrichedArtist;
      }),
    );

    return {
      artists: enrichedArtists,
      meta: result.meta,
    };
  }
}
