import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../../global/infrastructure/guards/auth.guard';
import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import {
  CreateInteractionDto,
  InteractionDto,
} from '../domain/dtos/interaction.dto';

import { InteractionsHandler } from './interactions.handler';

@ApiTags('Interactions')
@UseGuards(AuthGuard)
@Controller('interactions')
export class InteractionsController {
  constructor(
    private readonly interactionsHandler: InteractionsHandler,
    private readonly requestContext: RequestContextService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new interaction' })
  @ApiResponse({
    status: 201,
    description: 'Interaction created successfully',
    type: InteractionDto,
  })
  async createInteraction(
    @Body() createInteractionDto: CreateInteractionDto,
  ): Promise<InteractionDto> {
    const userId = this.requestContext.userId;
    return this.interactionsHandler.createInteraction(
      userId,
      createInteractionDto,
    );
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user interactions with an entity' })
  @ApiResponse({
    status: 200,
    description: 'Interactions retrieved successfully',
    type: [InteractionDto],
  })
  @ApiQuery({ name: 'entityType', description: 'Entity type', required: true })
  @ApiQuery({ name: 'entityId', description: 'Entity ID', required: true })
  @ApiQuery({ name: 'type', description: 'Interaction type', required: false })
  async getUserInteractions(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('type') interactionType?: string,
  ): Promise<InteractionDto[]> {
    const userId = this.requestContext.userId;
    return this.interactionsHandler.getUserInteractions(
      userId,
      entityType,
      entityId,
      interactionType,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an interaction' })
  @ApiResponse({
    status: 200,
    description: 'Interaction deleted successfully',
  })
  @ApiParam({ name: 'id', description: 'Interaction ID' })
  async deleteInteraction(@Param('id') id: string): Promise<void> {
    const userId = this.requestContext.userId;
    return this.interactionsHandler.deleteInteraction(userId, id);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending content for an entity type' })
  @ApiResponse({
    status: 200,
    description: 'Trending content retrieved successfully',
  })
  @ApiQuery({ name: 'entityType', description: 'Entity type', required: true })
  @ApiQuery({
    name: 'limit',
    description: 'Number of results to return',
    required: false,
  })
  @ApiQuery({
    name: 'daysBack',
    description: 'Number of days to look back',
    required: false,
  })
  async getTrendingContent(
    @Query('entityType') entityType: string,
    @Query('limit') limit?: number,
    @Query('daysBack') daysBack?: number,
  ): Promise<{ entityId: string; count: number }[]> {
    return this.interactionsHandler.getTrendingContent(
      entityType,
      limit ? Number(limit) : undefined,
      daysBack ? Number(daysBack) : undefined,
    );
  }
}
