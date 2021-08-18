import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaModule } from '../agenda/agenda.module';
import { FollowsModule } from '../follows/follows.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { ArtistsService } from './domain/services/artists.service';
import { ArtistsController } from './infrastructure/artists.controller';
import { ArtistsHandler } from './infrastructure/artists.handler';
import { Artist } from './infrastructure/entities/artist.entity';
import { CreateArtistUseCase } from './usecases/createArtist.usecase';
import { FindArtistsUseCases } from './usecases/findArtist.usecases';
import { UpdateArtistBasicInfoUseCase } from './usecases/updateArtistBasicInfo.usecase';
import { UpdateArtistProfilePictureUseCase } from './usecases/updateArtistProfilePicture.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artist], 'artist-db'),
    MultimediasModule,
    FollowsModule,
    AgendaModule,
  ],
  providers: [
    ArtistsHandler,
    ArtistsService,
    CreateArtistUseCase,
    FindArtistsUseCases,
    UpdateArtistProfilePictureUseCase,
    UpdateArtistBasicInfoUseCase,
  ],
  controllers: [ArtistsController],
  exports: [ArtistsService],
})
export class ArtistsModule {}
