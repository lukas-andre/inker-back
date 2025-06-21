import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../../global/infrastructure/guards/auth.guard';
import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import { AnalyticsInteractionResponseDto } from '../domain/dtos/analytics-interaction-response.dto';
import {
  ArtistMetricsDto,
  BatchMetricsQueryDto,
  ContentMetricsDto,
  RecordArtistViewDto,
  RecordInteractionDto,
} from '../domain/dtos/metrics.dto';
import { ContentType } from '../domain/enums/content-types.enum';
import { GetArtistMetricsUseCase } from '../usecases/getArtistMetrics.usecase';
import { GetBatchContentMetricsUseCase } from '../usecases/getBatchContentMetrics.usecase';
import { GetContentMetricsUseCase } from '../usecases/getContentMetrics.usecase';
import { RecordArtistFollowUseCase } from '../usecases/recordArtistFollow.usecase';
import { RecordArtistViewUseCase } from '../usecases/recordArtistView.usecase';
import { RecordInteractionUseCase } from '../usecases/recordInteraction.usecase';

@ApiTags('Analytics')
@UseGuards(AuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly recordInteractionUseCase: RecordInteractionUseCase,
    private readonly recordArtistViewUseCase: RecordArtistViewUseCase,
    private readonly getContentMetricsUseCase: GetContentMetricsUseCase,
    private readonly getArtistMetricsUseCase: GetArtistMetricsUseCase,
    private readonly getBatchContentMetricsUseCase: GetBatchContentMetricsUseCase,
    private readonly recordArtistFollowUseCase: RecordArtistFollowUseCase,
    private readonly requestContext: RequestContextService,
  ) {}

  @Post('interactions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a content interaction (view, like, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the interaction result with updated metrics',
    type: AnalyticsInteractionResponseDto,
  })
  async recordInteraction(
    @Body() dto: RecordInteractionDto,
  ): Promise<AnalyticsInteractionResponseDto> {
    const userId = this.requestContext.userId;
    return this.recordInteractionUseCase.execute(userId, dto);
  }

  @Post('interactions/artist/view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record an artist profile view' })
  @ApiResponse({
    status: 204,
    description: 'Artist view recorded successfully',
  })
  async recordArtistView(@Body() dto: RecordArtistViewDto): Promise<void> {
    const userId = this.requestContext.userId;
    return this.recordArtistViewUseCase.execute(userId, dto);
  }

  @Post('interactions/artist/follow')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record an artist follow' })
  @ApiResponse({
    status: 204,
    description: 'Artist follow recorded successfully',
  })
  async recordArtistFollow(
    @Body('artistId') artistId: string,
    @Body('fromContentView') fromContentView = false,
  ): Promise<void> {
    return this.recordArtistFollowUseCase.execute(artistId, fromContentView);
  }

  @Get('content/:contentId')
  @ApiOperation({ summary: 'Get metrics for a specific content item' })
  @ApiParam({ name: 'contentId', description: 'Content ID' })
  @ApiResponse({
    status: 200,
    description: 'Content metrics retrieved successfully',
    type: ContentMetricsDto,
  })
  async getContentMetrics(
    @Param('contentId') contentId: string,
    @Query('type') contentType: ContentType,
  ): Promise<ContentMetricsDto> {
    const userId = this.requestContext.userId;
    return this.getContentMetricsUseCase.execute(
      contentId,
      contentType,
      userId,
    );
  }

  @Get('artist/:artistId')
  @ApiOperation({ summary: 'Get metrics for a specific artist' })
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  @ApiResponse({
    status: 200,
    description: 'Artist metrics retrieved successfully',
    type: ArtistMetricsDto,
  })
  async getArtistMetrics(
    @Param('artistId') artistId: string,
  ): Promise<ArtistMetricsDto> {
    return this.getArtistMetricsUseCase.execute(artistId);
  }

  @Post('feed')
  @ApiOperation({ summary: 'Get batch metrics for multiple content items' })
  @ApiResponse({
    status: 200,
    description: 'Batch metrics retrieved successfully',
    type: [ContentMetricsDto],
  })
  async getBatchContentMetrics(
    @Body() dto: BatchMetricsQueryDto,
  ): Promise<ContentMetricsDto[]> {
    const userId = this.requestContext.userId;
    return this.getBatchContentMetricsUseCase.execute(dto, userId);
  }
}
