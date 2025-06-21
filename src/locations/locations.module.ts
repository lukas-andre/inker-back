import { Module } from '@nestjs/common';

import { ArtistsRepositoryModule } from '../artists/infrastructure/repositories/artistRepository.module';
import { FollowProviderModule } from '../follows/infrastructure/database/followProvider.module';
import { ReviewRepositoryModule } from '../reviews/database/reviewRepository.module';

import { LocationRepositoryModule } from './infrastructure/database/locationRepository.module';
import { LocationsController } from './infrastructure/locations.controller';
import { LocationsHandler } from './infrastructure/locations.handler';
import { CreateArtistLocationUseCase } from './useCases/artistLocations/createArtistLocation.usecase';
import { DeleteArtistLocationUseCase } from './useCases/artistLocations/deleteArtistLocation.usecase';
import { GetArtistLocationsUseCase } from './useCases/artistLocations/getArtistLocations.usecase';
import { UpdateArtistLocationUseCase } from './useCases/artistLocations/updateArtistLocation.usecase';
import { AddLocationByApiUseCase } from './usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from './usecases/findArtistByRange.usecase';

@Module({
  imports: [
    ArtistsRepositoryModule,
    LocationRepositoryModule,
    ReviewRepositoryModule,
    FollowProviderModule,
  ],
  controllers: [LocationsController],
  providers: [
    LocationsHandler,
    AddLocationByApiUseCase,
    FindArtistByRangeUseCase,
    CreateArtistLocationUseCase,
    GetArtistLocationsUseCase,
    UpdateArtistLocationUseCase,
    DeleteArtistLocationUseCase,
  ],
})
export class LocationsModule {}
