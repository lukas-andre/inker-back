import { Controller, Post, Body, Logger, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AddLocationDto } from './dtos/addLocation.dto';
import { FindArtistByArtistDto } from './dtos/findArtistByRange.dto';
import { LocationsHandler } from './locations.handler';

@ApiTags('locations')
@Controller('locations')
export class LocationsCrontoller {
  private readonly logger = new Logger(LocationsCrontoller.name);
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
    type: null,
  })
  @Post('artist')
  async findArtistByRange(@Body() body: FindArtistByArtistDto): Promise<any> {
    return this.locationsHandler.handleFindArtistByRange(body);
  }
}
