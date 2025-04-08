import { Injectable } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';

import { FollowedsRepository } from '../../follows/infrastructure/database/followeds.repository';
import { FollowingsRepository } from '../../follows/infrastructure/database/followings.repository';
import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { ArtistRepository } from '../infrastructure/repositories/artist.repository';
import { Artist } from '../infrastructure/entities/artist.entity';
import { ReviewAvgRepository } from '../../reviews/database/repositories/reviewAvg.repository';

import { FindArtistByIdResult } from './interfaces/findArtistById.result';

// Definimos una interfaz para las opciones de include
export interface FindArtistOptions {
  includeFollows?: boolean;        // Incluir conteo de seguidores y seguidos
  includeRatings?: boolean;        // Incluir calificaciones
  includeUserFollow?: boolean;     // Incluir si el usuario actual sigue al artista
  includeWorkCounts?: boolean;     // Incluir conteo de trabajos (total y visibles)
  includeStencilCounts?: boolean;  // Incluir conteo de stencils (total y visibles)
  includeAll?: boolean;            // Incluir toda la información disponible
  currentUserId?: string;          // ID del usuario actual (para verificar follows)
}

@Injectable()
export class FindArtistsUseCases extends BaseUseCase {
  constructor(
    private readonly artistProvider: ArtistRepository,
    private readonly followedsProvider: FollowedsRepository,
    private readonly followingProvider: FollowingsRepository,
    private readonly reviewAvgProvider: ReviewAvgRepository,
  ) {
    super(FindArtistsUseCases.name);
  }

  async findById(id: string, options: FindArtistOptions = {}): Promise<FindArtistByIdResult> {
    // Si includeAll está activado, activamos todas las opciones
    if (options.includeAll) {
      options = {
        ...options,
        includeFollows: true,
        includeRatings: true,
        includeUserFollow: true,
        includeWorkCounts: true,
        includeStencilCounts: true,
      };
    }

    const artist: Partial<FindArtistByIdResult> =
      await this.artistProvider.findByIdWithJoins(id);

    if (!artist) {
      throw new DomainNotFound('Artist not found');
    }

    // Crear un array de promesas que se ejecutarán en paralelo
    const promises = [];
    const results = [];

    // Agregar promesas según las opciones de include
    if (options.includeFollows) {
      promises.push(this.followedsProvider.countFollowers(artist.userId));
      promises.push(this.followingProvider.countFollows(artist.userId));
    }

    if (options.includeRatings) {
      promises.push(this.reviewAvgProvider.findAvgByArtistIds([id]));
    }

    if (options.includeUserFollow && options.currentUserId) {
      promises.push(this.followingProvider.userFollowsArtist(options.currentUserId, id));
    }

    // Ejecutar todas las promesas en paralelo
    if (promises.length > 0) {
      const promiseResults = await Promise.all(promises);
      
      // Asignar los resultados de las promesas
      let index = 0;
      
      if (options.includeFollows) {
        artist.followers = promiseResults[index++];
        artist.follows = promiseResults[index++];
      }
      
      if (options.includeRatings) {
        // findAvgByArtistIds devuelve un array, tomamos el primero o creamos un objeto vacío
        const reviewsAvgArray = promiseResults[index++];
        artist.review = reviewsAvgArray && reviewsAvgArray.length > 0 ? reviewsAvgArray[0] : { artistId: id, avgRating: 0, count: 0 };
      }
      
      if (options.includeUserFollow && options.currentUserId) {
        artist.isFollowedByUser = promiseResults[index++];
      }
    }

    // Incluir los contadores de works y stencils que ya están disponibles
    // en la entidad Artist gracias a nuestras modificaciones anteriores
    if (options.includeWorkCounts) {
      artist.worksCount = artist.worksCount || 0;
      artist.visibleWorksCount = artist.visibleWorksCount || 0;
    }

    if (options.includeStencilCounts) {
      artist.stencilsCount = artist.stencilsCount || 0;
      artist.visibleStencilsCount = artist.visibleStencilsCount || 0;
    }

    return artist as FindArtistByIdResult;
  }

  async findOne(options: FindManyOptions<Artist>, includeOptions: FindArtistOptions = {}): Promise<any> {
    const artist = await this.artistProvider.findOne(options);
    
    if (!artist) {
      return null;
    }
    
    // Si se solicitan opciones de include, usamos findById para obtener la información adicional
    if (includeOptions && (
      includeOptions.includeAll || 
      includeOptions.includeFollows || 
      includeOptions.includeRatings || 
      includeOptions.includeUserFollow ||
      includeOptions.includeWorkCounts ||
      includeOptions.includeStencilCounts
    )) {
      return this.findById(artist.id, includeOptions);
    }
    
    return artist;
  }

  async findAll(options: FindManyOptions<Artist>, includeOptions: FindArtistOptions = {}): Promise<any[]> {
    const artists = await this.artistProvider.find(options);
    
    // Si no hay opciones de include, devolvemos tal cual
    if (!includeOptions || !(
      includeOptions.includeAll || 
      includeOptions.includeFollows || 
      includeOptions.includeRatings || 
      includeOptions.includeUserFollow ||
      includeOptions.includeWorkCounts ||
      includeOptions.includeStencilCounts
    )) {
      return artists;
    }
    
    // Si hay opciones de include, obtenemos la información adicional para cada artista
    const enrichedArtists = await Promise.all(
      artists.map(artist => this.findById(artist.id, includeOptions))
    );
    
    return enrichedArtists;
  }
}
