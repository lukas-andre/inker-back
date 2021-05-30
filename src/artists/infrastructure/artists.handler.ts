import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
import { UpdateArtistBasicInfoUseCase } from '../usecases/updateArtstBasicInfo.usecase';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
@Injectable()
export class ArtistsHandler extends BaseHandler {
  constructor(
    private readonly createArtistUseCase: CreateArtistUseCase,
    private readonly findArtistsUseCases: FindArtistsUseCases,
    private readonly updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase,
    private readonly updateArtistBasicInfoUseCase: UpdateArtistBasicInfoUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleCreate(dto: CreateArtistDto): Promise<BaseArtistResponse> {
    return this.resolve(await this.createArtistUseCase.execute(dto));
  }

  async handleUpdateProfileProflePicture(
    id: number,
    file: any,
  ): Promise<BaseArtistResponse> {
    return this.resolve(
      await this.updateArtistProfilePictureUseCase.execute(id, file),
    );
  }

  async handleFindById(id: number): Promise<BaseArtistResponse> {
    return this.resolve(await this.findArtistsUseCases.findById(id));
  }
  async handleGetAll(): Promise<BaseArtistResponse[]> {
    return this.findArtistsUseCases.findAll({});
  }

  async handleUpdateArtistBasicInfo(
    id: number,
    dto: UpdateArtistDto,
  ): Promise<BaseArtistResponse> {
    return this.resolve(
      await this.updateArtistBasicInfoUseCase.execute(id, dto),
    );
  }
}
