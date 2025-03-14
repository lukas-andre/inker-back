import { Module } from '@nestjs/common';
import { ArtistsController } from './infrastructure/artists.controller';
import { ArtistsHandler } from './infrastructure/artists.handler';
import { CreateArtistUseCase } from './usecases/createArtist.usecase';
import { WorksController } from './infrastructure/controllers/works.controller';
import { StencilsController } from './infrastructure/controllers/stencils.controller';
import { ArtistStylesController } from './infrastructure/controllers/artistStyles.controller';
import { WorkProviderModule } from './infrastructure/database/workProvider.module';
import { StencilProviderModule } from './infrastructure/database/stencilProvider.module';
import { ArtistStyleProviderModule } from './infrastructure/database/artistStyleProvider.module';
import { GetWorksUseCase } from './usecases/work/getWorks.usecase';
import { CreateWorkUseCase } from './usecases/work/createWork.usecase';
import { GetWorkByIdUseCase } from './usecases/work/getWorkById.usecase';
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
import { ArtistsProviderModule } from './infrastructure/database/artistProvider.module';
import { FindArtistsUsecase } from './usecases/findArtists.usecase';
import { UpdateArtistBasicInfoUseCase } from './usecases/updateArtistBasicInfo.usecase';
import { UpdateArtistProfilePictureUseCase } from './usecases/updateArtistProfilePicture.usecase';
import { UpdateArtistStudioPhotoUseCase } from './usecases/updateArtistStudioPhoto.usecase';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { FollowsModule } from '../follows/follows.module';
import { FindArtistsUseCases } from './usecases/findArtist.usecases';
import { AgendaProviderModule } from '../agenda/infrastructure/providers/agendaProvider.module';
import { FollowProviderModule } from '../follows/infrastructure/database/followProvider.module';
import { TagsModule } from '../tags/tags.module';
import { SearchStencilsUseCase } from './usecases/stencil/search-stencils.usecase';
import { GetTagSuggestionsUseCase } from './usecases/stencil/get-tag-suggestions.usecase';
import { StencilSearchController } from './infrastructure/controllers/stencil-search.controller';
import { InteractionsModule } from '../interactions/interactions.module';
import { InteractionProviderModule } from '../interactions/infrastructure/database/interactionProvider.module';

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
  // Stencil use cases
  GetStencilsUseCase,
  CreateStencilUseCase,
  GetStencilByIdUseCase,
  UpdateStencilUseCase,
  DeleteStencilUseCase,
  // Stencil search use cases
  SearchStencilsUseCase,
  GetTagSuggestionsUseCase,
  // Artist Style use cases
  GetArtistStylesUseCase,
  AddArtistStyleUseCase,
  UpdateArtistStyleUseCase,
  RemoveArtistStyleUseCase,
];

@Module({
  imports: [
    AgendaProviderModule,
    ArtistsProviderModule,
    FollowProviderModule,
    WorkProviderModule,
    StencilProviderModule,
    ArtistStyleProviderModule,
    MultimediasModule,
    FollowsModule,
    TagsModule,
    InteractionProviderModule,
  ],
  controllers: [
    ArtistsController,
    WorksController,
    StencilsController,
    ArtistStylesController,
    StencilSearchController,
  ],
  providers: [ArtistsHandler, ...useCases],
  exports: [ArtistsHandler],
})
export class ArtistsModule {}