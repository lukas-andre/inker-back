import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '../../global/infrastructure/guards/auth.guard';
import { errorCodesToOASDescription } from '../../global/infrastructure/helpers/errorCodesToOASDescription.helper';
import {
  NO_ARTISTS_FOUND,
  PROBLEMS_FILTERING_ARTISTS,
  TROUBLE_FINDING_LOCATIONS,
} from '../domain/codes/codes';
import {
  ArtistLocationCreateDto,
  ArtistLocationDto,
  ArtistLocationUpdateDto,
} from '../domain/interfaces/artistLocation.interface';

import { AddLocationDto } from './dtos/addLocation.dto';
import { FindArtistByRangeDTORequest } from './dtos/findArtistByRangeRequest.dto';
import { FindArtistByRangeResponseDTO } from './dtos/findArtistByRangeResponse.dto';
import { LocationsHandler } from './locations.handler';

@ApiTags('locations')
@Controller('locations')
@UseGuards(AuthGuard)
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

  /* Artist Locations CRUD endpoints */

  @ApiOperation({ summary: 'Create a new artist location' })
  @ApiParam({ name: 'artistId', description: 'Artist ID', type: 'number' })
  @ApiOkResponse({
    description: 'Artist location successfully created',
    type: ArtistLocationDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request. Artist already has 3 locations or invalid data.',
  })
  @Post('artist/:artistId/locations')
  async createArtistLocation(
    @Param('artistId') artistId: string,
    @Body() body: ArtistLocationCreateDto,
  ): Promise<ArtistLocationDto> {
    return this.locationsHandler.handleCreateArtistLocation(artistId, body);
  }

  @ApiOperation({ summary: 'Get artist locations' })
  @ApiParam({ name: 'artistId', description: 'Artist ID', type: 'string' })
  @ApiOkResponse({
    description: 'Artist locations successfully retrieved',
    type: ArtistLocationDto,
    isArray: true,
  })
  @Get('artist/:artistId/locations')
  async getArtistLocations(
    @Param('artistId') artistId: string,
  ): Promise<ArtistLocationDto[]> {
    return this.locationsHandler.handleGetArtistLocations(artistId);
  }

  @ApiOperation({ summary: 'Update an artist location' })
  @ApiParam({ name: 'artistId', description: 'Artist ID', type: 'string' })
  @ApiParam({ name: 'locationId', description: 'Location ID', type: 'string' })
  @ApiOkResponse({
    description: 'Artist location successfully updated',
    type: ArtistLocationDto,
  })
  @ApiNotFoundResponse({ description: 'Artist location not found' })
  @Put('artist/:artistId/locations/:locationId')
  async updateArtistLocation(
    @Param('artistId') artistId: string,
    @Param('locationId') locationId: string,
    @Body() body: ArtistLocationUpdateDto,
  ): Promise<ArtistLocationDto> {
    return this.locationsHandler.handleUpdateArtistLocation(
      artistId,
      locationId,
      body,
    );
  }

  @ApiOperation({ summary: 'Delete an artist location' })
  @ApiParam({ name: 'artistId', description: 'Artist ID', type: 'string' })
  @ApiParam({ name: 'locationId', description: 'Location ID', type: 'string' })
  @ApiOkResponse({
    description: 'Artist location successfully deleted',
    type: Boolean,
  })
  @ApiNotFoundResponse({ description: 'Artist location not found' })
  @Delete('artist/:artistId/locations/:locationId')
  async deleteArtistLocation(
    @Param('artistId') artistId: string,
    @Param('locationId') locationId: string,
  ): Promise<boolean> {
    return this.locationsHandler.handleDeleteArtistLocation(
      artistId,
      locationId,
    );
  }
}
