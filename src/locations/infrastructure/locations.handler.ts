import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { AddLocationByApiUseCase } from '../usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from '../usecases/findArtistByRange.usecase';
import { AddLocationDto } from './dtos/addLocation.dto';
import { FindArtistByArtistDto } from './dtos/findArtistByRange.dto';

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
    dto: FindArtistByArtistDto,
  ): Promise<any> {
    return this.findArtistByRangeUseCase.execute(dto);
  }
}
