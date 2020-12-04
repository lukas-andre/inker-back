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
import { Follower } from './infrastructure/entities/follower.entity';
import { Gender } from './infrastructure/entities/genders.entity';
import { Tag } from './infrastructure/entities/tag.entity';
import { FollowUseCase } from './usecases/followArtist.usecase';
import { UnfollowArtistUseCase } from './usecases/unfollowArtist.usecase';
import { FollowersService } from './domain/services/followers.service';
import { FindArtistFollowersUseCase } from './usecases/findArtistFollowers.usecase';
import { FindArtistFollowsUseCase } from './usecases/findArtistFollows.usecase';
import { FollowsService } from './domain/services/follows.service';
import { Follow } from './infrastructure/entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artist, Follower, Follow, Gender, Tag], 'artist-db'),
    MultimediasModule,
  ],
  providers: [
    ArtistsHandler,
    ArtistsService,
    FollowersService,
    FollowsService,
    CreateArtistUseCase,
    FindArtistsUseCases,
    FindArtistFollowersUseCase,
    FindArtistFollowsUseCase,
    UpdateArtistProfilePictureUseCase,
    UpdateArtistBasicInfoUseCase,
    FollowUseCase,
    UnfollowArtistUseCase
  ],
  controllers: [ArtistsController],
  exports: [ArtistsService],
})
export class ArtistsModule {}
