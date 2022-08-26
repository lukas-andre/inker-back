import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddLocationDto } from './dtos/addLocation.dto';
import { FindArtistByArtistDtoRequest } from './dtos/findArtistByRangeRequest.dto';
import { FindArtistByRangeResponseDto } from './dtos/findArtistByRangeResponse.dto';
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
    type: FindArtistByRangeResponseDto,
    isArray: true,
  })
  @Post('artist')
  async findArtistByRange(
    @Body() body: FindArtistByArtistDtoRequest,
  ): Promise<any> {
    return this.locationsHandler.handleFindArtistByRange(body);
  }
}
