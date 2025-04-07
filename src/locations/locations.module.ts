import { Module } from '@nestjs/common';

import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { FollowProviderModule } from '../follows/infrastructure/database/followProvider.module';
import { ReviewProviderModule } from '../reviews/database/reviewProvider.module';

import { LocationProviderModule } from './infrastructure/database/locationProvider.module';
import { LocationsController } from './infrastructure/locations.controller';
import { LocationsHandler } from './infrastructure/locations.handler';
import { AddLocationByApiUseCase } from './usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from './usecases/findArtistByRange.usecase';
import { CreateArtistLocationUseCase } from './useCases/artistLocations/createArtistLocation.usecase';
import { GetArtistLocationsUseCase } from './useCases/artistLocations/getArtistLocations.usecase';
import { UpdateArtistLocationUseCase } from './useCases/artistLocations/updateArtistLocation.usecase';
import { DeleteArtistLocationUseCase } from './useCases/artistLocations/deleteArtistLocation.usecase';

@Module({
  imports: [
    ArtistsProviderModule,
    LocationProviderModule,
    ReviewProviderModule,
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
