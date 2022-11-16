import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AgendaEventIdPipe } from '../agenda/infrastructure/pipes/agendaEventId.pipe';
import { ArtistIdPipe } from '../artists/infrastructure/pipes/artistId.pipe';

import { ReviewArtistRequestDto } from './dtos/reviewArtistRequest.dto';
import { ReviewHandler } from './reviews.handler';

@ApiTags('reviews')
@Controller('reviews')
export class RatingsController {
  private readonly logger = new Logger(RatingsController.name);
  constructor(private readonly reviewHandler: ReviewHandler) {}

  @ApiOperation({ summary: 'Find all reviews for an artist' })
  @ApiParam({ name: 'artistId', type: 'number' })
  @Get(':artistId')
  async findAll(@Param('artistId', ParseIntPipe) params: number) {
    return params;
  }

  @ApiOperation({ summary: 'Create a new review for an artist' })
  @ApiParam({ name: 'artistId', type: 'number' })
  @ApiParam({ name: 'eventId', type: 'number' })
  @Post(':artistId/events/:eventId')
  async reviewArtist(
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    @Param('artistId', ArtistIdPipe) artistId: number,
    @Body() body: ReviewArtistRequestDto,
  ) {
    this.logger.log(`artistId: ${artistId} eventId: ${eventId}`);
    this.logger.log(`body: ${JSON.stringify(body)}`);
    return artistId;
  }
}
