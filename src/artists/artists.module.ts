import { Module } from '@nestjs/common';

import { AgendaRepositoryModule } from '../agenda/infrastructure/repositories/agendaRepository.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { FollowsModule } from '../follows/follows.module';
import { FollowProviderModule } from '../follows/infrastructure/database/followProvider.module';
import { InteractionProviderModule } from '../interactions/infrastructure/database/repositories/interactionRepository.module';
import { InteractionsModule } from '../interactions/interactions.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { ReviewAvgRepository } from '../reviews/database/repositories/reviewAvg.repository';
import { TagsRepositoryModule } from '../tags/tagsRespository.module';

import { ArtistsController } from './infrastructure/artists.controller';
import { ArtistsHandler } from './infrastructure/artists.handler';
import { WorksController } from './infrastructure/controllers/works.controller';
import { CreateArtistUseCase } from './usecases/createArtist.usecase';
import { StencilsController } from './infrastructure/controllers/stencils.controller';
import { ArtistStylesController } from './infrastructure/controllers/artistStyles.controller';
import { WorkRepositoryModule } from './infrastructure/repositories/workRepository.module';
import { StencilRepositoryModule } from './infrastructure/repositories/stencilRepository.module';
import { ArtistStyleProviderModule } from './infrastructure/repositories/artistStyleRepository.module';
import { CreateWorkUseCase } from './usecases/work/createWork.usecase';
import { GetWorksUseCase } from './usecases/work/getWorks.usecase';
import { GetWorkByIdUseCase } from './usecases/work/getWorkById.usecase';
import { SearchWorksUseCase } from './usecases/work/search-works.usecase';
import { UpdateWorkUseCase } from './usecases/work/updateWork.usecase';
import { DeleteWorkUseCase } from './usecases/work/deleteWork.usecase';
import { GetStencilsUseCase } from './usecases/stencil/getStencils.usecase';
import { CreateStencilUseCase } from './usecases/stencil/createStencil.usecase';
import { GetStencilByIdUseCase } from './usecases/stencil/getStencilById.usecase';
import { UpdateStencilUseCase } from './usecases/stencil/updateStencil.usecase';
import { DeleteStencilUseCase } from './usecases/stencil/deleteStencil.usecase';
import { GetArtistStylesUseCase } from './usecases/artistStyle/getArtistStyles.usecase';
import { AddArtistStyleUseCase } from './usecases/artistStyle/addArtistStyle.usecase';
import { UpdateArtistStyleUseCase } from './usecases/artistStyle/updateArtistStyle.usecase';
import { RemoveArtistStyleUseCase } from './usecases/artistStyle/removeArtistStyle.usecase';
import { ArtistsRepositoryModule } from './infrastructure/repositories/artistRepository.module';
import { FindArtistsUsecase } from './usecases/findArtists.usecase';
import { UpdateArtistBasicInfoUseCase } from './usecases/updateArtistBasicInfo.usecase';
import { UpdateArtistProfilePictureUseCase } from './usecases/updateArtistProfilePicture.usecase';
import { UpdateArtistStudioPhotoUseCase } from './usecases/updateArtistStudioPhoto.usecase';

import { FindArtistsUseCases } from './usecases/findArtist.usecases';


import { SearchStencilsUseCase } from './usecases/stencil/search-stencils.usecase';
import { GetTagSuggestionsUseCase } from './usecases/stencil/get-tag-suggestions.usecase';
import { StencilSearchController } from './infrastructure/controllers/stencil-search.controller';


import { GetWorkTagSuggestionsUseCase } from './usecases/work/get-tag-suggestions.usecase';
import { WorkSearchController } from './infrastructure/controllers/work-search.controller';
import { GetWorksPaginatedUseCase } from './usecases/work/get-works-paginated.usecase';
import { CreateTagUseCase } from './usecases/stencil/create-tag.usecase';

import { ReviewRepositoryModule } from '../reviews/database/reviewRepository.module';

const useCases = [
  CreateArtistUseCase,
  // Basic Artist use cases
  FindArtistsUsecase,
  FindArtistsUseCases,
  UpdateArtistBasicInfoUseCase,
  UpdateArtistProfilePictureUseCase,
  UpdateArtistStudioPhotoUseCase,
  // Work use cases
  GetWorksUseCase,
  CreateWorkUseCase,
  GetWorkByIdUseCase,
  UpdateWorkUseCase,
  DeleteWorkUseCase,
  GetWorksPaginatedUseCase,
  // Stencil use cases
  GetStencilsUseCase,
  CreateStencilUseCase,
  GetStencilByIdUseCase,
  UpdateStencilUseCase,
  DeleteStencilUseCase,
  // Stencil search use cases
  SearchStencilsUseCase,
  GetTagSuggestionsUseCase,
  CreateTagUseCase,
  // Artist Style use cases
  GetArtistStylesUseCase,
  AddArtistStyleUseCase,
  UpdateArtistStyleUseCase,
  RemoveArtistStyleUseCase,
  // Work search use cases
  SearchWorksUseCase,
  GetWorkTagSuggestionsUseCase,
];

@Module({
  imports: [
    AgendaRepositoryModule,
    AnalyticsModule,
    ArtistsRepositoryModule,
    FollowProviderModule,
    WorkRepositoryModule,
    StencilRepositoryModule,
    ArtistStyleProviderModule,
    MultimediasModule,
    FollowsModule,
    InteractionProviderModule,
    TagsRepositoryModule,
    ReviewRepositoryModule,
  ],
  controllers: [
    ArtistsController,
    WorksController,
    StencilsController,
    ArtistStylesController,
    StencilSearchController,
    WorkSearchController,
  ],
  providers: [ArtistsHandler, ...useCases],
  exports: [ArtistsHandler],
})
export class ArtistsModule {}
