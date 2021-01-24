import { Module } from '@nestjs/common';
import { ArtistsService } from './domain/services/artists.service';
import { ArtistsController } from './infrastructure/artists.controller';
import { Artist } from './infrastructure/entities/artist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsHandler } from './infrastructure/artists.handler';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { CreateArtistUseCase } from './usecases/createArtist.usecase';
import { FindArtistsUseCases } from './usecases/findArtist.usecases';
import { UpdateArtistProfilePictureUseCase } from './usecases/updateArtistProfilePicture.usecase';
import { UpdateArtistBasicInfoUseCase } from './usecases/updateArtstBasicInfo.usecase';
import { FollowsModule } from '../follows/follows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artist], 'artist-db'),
    MultimediasModule,
    FollowsModule,
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
