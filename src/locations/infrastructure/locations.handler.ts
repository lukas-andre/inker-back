import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { AddLocationByApiUseCase } from '../usescases/addLocationByApi.usecase';
import { AddLocationDto } from './dtos/addLocation.dto';

@Injectable()
export class LocationsHandler extends BaseHandler {
  constructor(
    private readonly addLocationByApiUseCase: AddLocationByApiUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  public async handleAddLocation(dto: AddLocationDto) {
    return this.resolve(await this.addLocationByApiUseCase.execute(dto));
  }
}
