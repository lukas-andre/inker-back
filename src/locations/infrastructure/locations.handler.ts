import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { AddLocationByApiUseCase } from '../usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from '../usecases/findArtistByRange.usecase';
import { AddLocationDto } from './dtos/addLocation.dto';
import { FindArtistByArtistDtoRequest } from './dtos/findArtistByRangeRequest.dto';
import { FindArtistByRangeResponseDto } from './dtos/findArtistByRangeResponse.dto';

@Injectable()
export class LocationsHandler extends BaseHandler {
  constructor(
    private readonly addLocationByApiUseCase: AddLocationByApiUseCase,
    private readonly findArtistByRangeUseCase: FindArtistByRangeUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  public async handleAddLocation(dto: AddLocationDto) {
    return this.addLocationByApiUseCase.execute(dto);
  }

  public async handleFindArtistByRange(
    dto: FindArtistByArtistDtoRequest,
  ): Promise<FindArtistByRangeResponseDto[]> {
    return this.findArtistByRangeUseCase.execute(dto);
  }
}
