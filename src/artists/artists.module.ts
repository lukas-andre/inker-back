import { Module } from '@nestjs/common';

import { AgendaProviderModule } from '../agenda/infrastructure/providers/agendaProvider.module';
import { FollowProviderModule } from '../follows/infrastructure/database/followProvider.module';
import { MultimediasModule } from '../multimedias/multimedias.module';

import { ArtistsController } from './infrastructure/artists.controller';
import { ArtistsHandler } from './infrastructure/artists.handler';
import { ArtistsProviderModule } from './infrastructure/database/artistProvider.module';
import { CreateArtistUseCase } from './usecases/createArtist.usecase';
import { FindArtistsUseCases } from './usecases/findArtist.usecases';
import { UpdateArtistBasicInfoUseCase } from './usecases/updateArtistBasicInfo.usecase';
import { UpdateArtistProfilePictureUseCase } from './usecases/updateArtistProfilePicture.usecase';
import { UpdateArtistStudioPhotoUseCase } from './usecases/updateArtistStudioPhoto.usecase';
import { FindArtistsUsecase } from './usecases/findArtists.usecase';

@Module({
  imports: [
    ArtistsProviderModule,
    AgendaProviderModule,
    MultimediasModule,
    FollowProviderModule,
  ],
  providers: [
    ArtistsHandler,
    CreateArtistUseCase,
    FindArtistsUseCases,
    UpdateArtistProfilePictureUseCase,
    UpdateArtistBasicInfoUseCase,
    UpdateArtistStudioPhotoUseCase,
    FindArtistsUsecase,
  ],
  controllers: [ArtistsController],
})
export class ArtistsModule {}
