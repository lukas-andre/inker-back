import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BaseHandler } from '../../global/infrastructure/base.handler';
import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { ArtistDto } from '../domain/dtos/artist.dto';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistBasicInfoUseCase } from '../usecases/updateArtistBasicInfo.usecase';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
import { UpdateArtistStudioPhotoUseCase } from '../usecases/updateArtistStudioPhoto.usecase';

import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { UpdateStudioPhotoResponseDto } from './dtos/updateStudioPhotoResponse.dto';
import { SearchArtistDto } from './dtos/searchArtist.dto';
import { FindArtistsUsecase } from '../usecases/findArtists.usecase';
@Injectable()
export class ArtistsHandler {
  constructor(
    private readonly createArtistUseCase: CreateArtistUseCase,
    private readonly findArtistsUseCases: FindArtistsUseCases,
    private readonly updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase,
    private readonly updateArtistStudioPhotoUseCase: UpdateArtistStudioPhotoUseCase,
    private readonly updateArtistBasicInfoUseCase: UpdateArtistBasicInfoUseCase,
    private readonly findArtistsUsecase: FindArtistsUsecase,
    private readonly requestContex: RequestContextService,
  ) {}

  async handleCreate(dto: CreateArtistDto): Promise<BaseArtistResponse> {
    return this.createArtistUseCase.execute(dto);
  }

  async handleUpdateProfilePicture(
    id: number,
    file: FileInterface,
  ): Promise<BaseArtistResponse> {
    return this.updateArtistProfilePictureUseCase.execute(id, file);
  }

  async handleUpdateStudioPhoto(
    id: number,
    file: FileInterface,
  ): Promise<ArtistDto> {
    return this.updateArtistStudioPhotoUseCase.execute(id, file);
  }

  async handleFindById(id: number): Promise<BaseArtistResponse> {
    return this.findArtistsUseCases.findById(id);
  }

  async handleGetAll(): Promise<BaseArtistResponse[]> {
    return this.findArtistsUseCases.findAll({});
  }

  async me(): Promise<BaseArtistResponse> {
    const { userTypeId } = this.requestContex;
    return this.findArtistsUseCases.findById(userTypeId);
  }

  async handleUpdateMe(dto: UpdateArtistDto): Promise<BaseArtistResponse> {
    const { userTypeId } = this.requestContex;
    return this.updateArtistBasicInfoUseCase.execute(userTypeId, dto);
  }

  async handleUpdateArtistBasicInfo(
    id: number,
    dto: UpdateArtistDto,
  ): Promise<BaseArtistResponse> {
    return this.updateArtistBasicInfoUseCase.execute(id, dto);
  }

  async handleSearchArtists(dto: SearchArtistDto) {
    return this.findArtistsUsecase.execute(dto);
  }
}
