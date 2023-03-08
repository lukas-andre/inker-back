import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { errorCodesToOASDescription } from '../../global/infrastructure/helpers/errorCodesToOASDescription.helper';
import {
  NO_ARTISTS_FOUND,
  PROBLEMS_FILTERING_ARTISTS,
  TROUBLE_FINDING_LOCATIONS,
} from '../domain/codes/codes';

import { AddLocationDto } from './dtos/addLocation.dto';
import { FindArtistByRangeDTORequest } from './dtos/findArtistByRangeRequest.dto';
import { FindArtistByRangeResponseDTO } from './dtos/findArtistByRangeResponse.dto';
import { LocationsHandler } from './locations.handler';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);
  constructor(private readonly locationsHandler: LocationsHandler) {}

  @ApiOperation({ summary: 'Add Location' })
  @ApiOkResponse({
    description: 'Location added ok',
    type: null,
  })
  @Post()
  async cretePost(@Body() body: AddLocationDto): Promise<any> {
    return this.locationsHandler.handleAddLocation(body);
  }

  @ApiOperation({ summary: 'Find artist by range in Kilometers' })
  @ApiOkResponse({
    description: 'Artists successfully found',
    type: FindArtistByRangeResponseDTO,
    isArray: true,
  })
  @ApiUnprocessableEntityResponse({
    description: errorCodesToOASDescription([
      TROUBLE_FINDING_LOCATIONS,
      PROBLEMS_FILTERING_ARTISTS,
    ]),
  })
  @ApiNotFoundResponse({ description: NO_ARTISTS_FOUND })
  @Post('artist')
  @HttpCode(HttpStatus.OK)
  async findArtistByRange(
    @Body() body: FindArtistByRangeDTORequest,
  ): Promise<FindArtistByRangeResponseDTO[]> {
    return this.locationsHandler.handleFindArtistByRange(body);
  }
}
