import {
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';

import { AgendaEventIdPipe } from '../agenda/infrastructure/pipes/agendaEventId.pipe';
import { ArtistIdPipe } from '../artists/infrastructure/pipes/artistId.pipe';

@ApiTags('reviews')
@Controller('reviews')
export class RatingsController {
  private readonly logger = new Logger(RatingsController.name);

  @ApiParam({ name: 'artistId', type: 'number' })
  @Get(':artistId')
  async findAll(@Param('artistId', ParseIntPipe) params: number) {
    return params;
  }

  @ApiParam({ name: 'artistId', type: 'number' })
  @ApiParam({ name: 'eventId', type: 'number' })
  @Post(':artistId/events/:eventId')
  async reviewArtist(
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    @Param('artistId', ArtistIdPipe) artistId: number,
  ) {
    this.logger.log(`artistId: ${artistId} eventId: ${eventId}`);
    return artistId;
  }
}
