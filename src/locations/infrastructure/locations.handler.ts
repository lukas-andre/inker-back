import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BaseHandler } from '../../global/infrastructure/base.handler';
import { RequestService } from '../../global/infrastructure/services/request.service';
import { AddLocationByApiUseCase } from '../usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from '../usecases/findArtistByRange.usecase';

import { AddLocationDto } from './dtos/addLocation.dto';
import { FindArtistByRangeDTORequest } from './dtos/findArtistByRangeRequest.dto';
import { FindArtistByRangeResponseDTO } from './dtos/findArtistByRangeResponse.dto';

@Injectable()
export class LocationsHandler extends BaseHandler {
  constructor(
    private readonly addLocationByApiUseCase: AddLocationByApiUseCase,
    private readonly findArtistByRangeUseCase: FindArtistByRangeUseCase,
    private readonly requestService: RequestService,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  public async handleAddLocation(dto: AddLocationDto) {
    return this.addLocationByApiUseCase.execute(dto);
  }

  public async handleFindArtistByRange(
    dto: FindArtistByRangeDTORequest,
  ): Promise<FindArtistByRangeResponseDTO[]> {
    return this.findArtistByRangeUseCase.execute(
      dto,
      this.requestService.userTypeId,
      this.requestService.userId,
    );
  }
}
