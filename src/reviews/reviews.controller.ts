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
import { UserIdPipe } from '../users/infrastructure/pipes/userId.pipe';

import { ReviewArtistRequestDto } from './dtos/reviewArtistRequest.dto';
import { ReviewHandler } from './reviews.handler';

@ApiTags('reviews')
@Controller('reviews')
export class RatingsController {
  private readonly logger = new Logger(RatingsController.name);
  constructor(private readonly handler: ReviewHandler) {}

  @ApiOperation({ summary: 'Find all reviews for an artist' })
  @ApiParam({ name: 'artistId', type: 'number' })
  @Get(':artistId')
  async findAll(@Param('artistId', ParseIntPipe) params: number) {
    return params;
  }

  @ApiOperation({ summary: 'Create a new review for an artist' })
  @ApiParam({ name: 'artistId', type: Number, example: 1 })
  @ApiParam({ name: 'eventId', type: Number, example: 1 })
  @Post(':artistId/events/:eventId/users/:userId')
  async reviewArtist(
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    @Param('artistId', ArtistIdPipe) artistId: number,
    @Param('userId', UserIdPipe) userId: number,
    @Body() body: ReviewArtistRequestDto,
  ) {
    this.logger.log(`artistId: ${artistId} eventId: ${eventId}`);
    this.logger.log({ body });
    return this.handler.reviewArtist(eventId, artistId, userId, body);
  }
}
