import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { AgendaEventIdPipe } from '../agenda/infrastructure/pipes/agendaEventId.pipe';
import { ArtistIdPipe } from '../artists/infrastructure/pipes/artistId.pipe';
import { ReviewReactionEnum } from '../reactions/domain/enums/reviewReaction.enum';
import { UserIdPipe } from '../users/infrastructure/pipes/userId.pipe';

import { GetReviewsFromArtistResponseDto } from './dtos/getReviewsFromArtistResponse.dto';
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
    return this.handler.reviewArtist(artistId, eventId, reviewer, body);
  }

  @ApiOperation({ summary: 'React to review' })
  @ApiParam({ name: 'reviewId', type: Number, example: 1 })
  @ApiParam({ name: 'reviewerId', type: Number, example: 1 })
  @Post('/:reviewId/reviewers/:reviewerId')
  async reactToReview(
    @Param('reviewId', ReviewIdPipe) reviewId: number,
    // TODO: This should be the customerId, not the userId
    @Param('reviewerId', UserIdPipe) reviewerId: number,
    @Query('reaction', ReviewReactionPipe) reaction: ReviewReactionEnum,
  ) {
    return this.handler.reactToReview(reviewId, reviewerId, reaction);
  }

  @ApiOperation({ summary: 'Get reviews from artist' })
  @ApiParam({ name: 'artistId', type: Number, example: 1 })
  @ApiQuery({ name: 'page', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, example: 3 })
  @ApiOkResponse({
    description: 'Get reviews from artist',
    type: GetReviewsFromArtistResponseDto,
  })
  @Get('artists/:artistId')
  async getReviewsFromArtist(
    @Param('artistId', ArtistIdPipe) artistId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit = 3,
  ) {
    return this.handler.getReviewFromArtist(artistId, page, limit);
  }
}
