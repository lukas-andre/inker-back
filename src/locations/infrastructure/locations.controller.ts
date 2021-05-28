import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AddLocationDto } from './dtos/addLocation.dto';
import { LocationsHandler } from './locations.handler';

@ApiTags('locations')
@Controller('locations')
export class LocationsCrontoller {
  private readonly logger = new Logger(LocationsCrontoller.name);
  constructor(private readonly locationsHandler: LocationsHandler) {}

  @ApiOperation({ summary: 'Add Location' })
  @ApiOkResponse({
    description: 'location added ok',
    type: null,
  })
  @Post()
  async cretePost(@Body() body: AddLocationDto): Promise<any> {
    return this.locationsHandler.handleAddLocation(body);
  }
}
