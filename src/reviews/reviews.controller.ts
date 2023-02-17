import { Body, Controller, Logger, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AgendaEventIdPipe } from '../agenda/infrastructure/pipes/agendaEventId.pipe';
import { ArtistIdPipe } from '../artists/infrastructure/pipes/artistId.pipe';
import { ReviewReactionEnum } from '../reactions/domain/enums/reviewReaction.enum';
import { UserIdPipe } from '../users/infrastructure/pipes/userId.pipe';

import { ReviewArtistRequestDto } from './dtos/reviewArtistRequest.dto';
import { ReviewIdPipe } from './pipes/review.pipe';
import { ReviewReactionPipe } from './pipes/reviewReactionEnum.pipe';
import { ReviewHandler } from './reviews.handler';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  private readonly logger = new Logger(ReviewsController.name);
  constructor(private readonly handler: ReviewHandler) {}

  // @ApiOperation({ summary: 'Find all reviews for an artist' })
  // @ApiParam({ name: 'artistId', type: 'number' })
  // @Get('/artists/:artistId')
  // async findAll(@Param('artistId', ParseIntPipe) params: number) {
  //   return params;
  // }

  @ApiOperation({ summary: 'Create a new review for an artist' })
  @ApiParam({ name: 'artistId', type: Number, example: 1 })
  @ApiParam({ name: 'eventId', type: Number, example: 1 })
  @ApiParam({ name: 'reviewerId', type: Number, example: 1 })
  @Post('/artists/:artistId/events/:eventId/reviewers/:reviewerId')
  async reviewArtist(
    @Param('artistId', ArtistIdPipe) artistId: number,
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    // TODO: This should be the customerId, not the userId
    @Param('reviewerId', UserIdPipe) reviewer: number,
    @Body() body: ReviewArtistRequestDto,
  ) {
    this.logger.log(`artistId: ${artistId} eventId: ${eventId}`, reviewer);
    this.logger.log({ body });
    return this.handler.reviewArtist(artistId, eventId, reviewer, body);
  }

  @ApiOperation({ summary: 'React to review' })
  @ApiParam({ name: 'reviewId', type: Number, example: 1 })
  @ApiParam({ name: 'reviewerId', type: Number, example: 1 })
  @Post('/reviews/:reviewId/reviewers/:reviewerId')
  async reactToReview(
    @Param('reviewId', ReviewIdPipe) reviewId: number,
    // TODO: This should be the customerId, not the userId
    @Param('reviewerId', UserIdPipe) reviewer: number,
    @Query('reaction', ReviewReactionPipe) reaction: ReviewReactionEnum,
  ) {
    this.logger.log(`reviewId: ${reviewId}`, reviewer);
    return this.handler.reactToReview(reviewId, reviewer, reaction);
  }
}
