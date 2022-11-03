import { Module } from '@nestjs/common';
import { AgendaModule } from '../agenda/agenda.module';
import { FollowsModule } from '../follows/follows.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { ArtistsController } from './infrastructure/artists.controller';
import { ArtistsHandler } from './infrastructure/artists.handler';
import { ArtistsDbModule } from './infrastructure/database/artistDb.module';
import { CreateArtistUseCase } from './usecases/createArtist.usecase';
import { FindArtistsUseCases } from './usecases/findArtist.usecases';
import { UpdateArtistBasicInfoUseCase } from './usecases/updateArtistBasicInfo.usecase';
import { UpdateArtistProfilePictureUseCase } from './usecases/updateArtistProfilePicture.usecase';
import { UpdateArtistStudioPhotoUseCase } from './usecases/updateArtistStudioPhoto.usecase';

@Module({
  imports: [ArtistsDbModule, MultimediasModule, FollowsModule, AgendaModule],
  providers: [
    ArtistsHandler,
    CreateArtistUseCase,
    FindArtistsUseCases,
    UpdateArtistProfilePictureUseCase,
    UpdateArtistBasicInfoUseCase,
    UpdateArtistStudioPhotoUseCase,
  ],
  controllers: [ArtistsController],
})
export class ArtistsModule {}
