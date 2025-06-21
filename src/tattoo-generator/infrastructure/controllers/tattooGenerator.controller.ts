import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { CreateTattooImageDto } from '../../domain/dto/create-tattoo-image.dto';
import { TattooImageResponseDto } from '../../domain/dto/tattoo-image-response.dto';
import { UpdateTattooFavoriteDto } from '../../domain/dto/update-tattoo-favorite.dto';
import { UserTattooHistoryResponseDto } from '../../domain/dto/user-tattoo-history.dto';
import { GenerateTattooImagesUseCase } from '../../usecases/generateTattooImages.usecase';
import { GetUserTattooHistoryUseCase } from '../../usecases/getUserTattooHistory.usecase';
import { UpdateTattooFavoriteUseCase } from '../../usecases/updateTattooFavorite.usecase';

@UseGuards(AuthGuard)
@ApiTags('tattoo-generator')
@Controller('tattoo-generator')
export class TattooGeneratorController {
  constructor(
    private readonly generateTattooImagesUseCase: GenerateTattooImagesUseCase,
    private readonly getUserTattooHistoryUseCase: GetUserTattooHistoryUseCase,
    private readonly updateTattooFavoriteUseCase: UpdateTattooFavoriteUseCase,
    private readonly requestContextService: RequestContextService,
  ) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate tattoo design images based on style and user input',
    description:
      'Generates tattoo designs using the specified style and user input. Returns multiple design options with their image URLs.',
  })
  @ApiResponse({
    status: 201,
    description: 'The tattoo images have been successfully generated',
    type: TattooImageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateTattooImages(
    @Body() createTattooImageDto: CreateTattooImageDto,
  ): Promise<TattooImageResponseDto> {
    return this.generateTattooImagesUseCase.execute(
      {
        style: createTattooImageDto.style,
        userInput: createTattooImageDto.userInput,
      },
      this.requestContextService.getContext(),
    );
  }

  @Get('history')
  @ApiOperation({
    summary: "Get user's tattoo design history",
    description:
      "Retrieves the current user's generated tattoo design history with optional filtering for favorites",
  })
  @ApiResponse({
    status: 200,
    description: "User's tattoo design history retrieved successfully",
    type: UserTattooHistoryResponseDto,
  })
  @ApiQuery({
    name: 'favorites',
    required: false,
    type: Boolean,
    description: 'Filter to show only favorites',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit the number of results',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset for pagination',
  })
  async getUserHistory(
    @Query('favorites') favorites?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<UserTattooHistoryResponseDto> {
    return this.getUserTattooHistoryUseCase.execute(
      {
        showOnlyFavorites: favorites === 'true',
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
        offset: offset ? parseInt(offset.toString(), 10) : undefined,
      },
      this.requestContextService.getContext(),
    );
  }

  @Patch('favorite')
  @ApiOperation({
    summary: 'Update favorite status for a tattoo design',
    description:
      'Mark or unmark a tattoo design as favorite for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateFavorite(
    @Body() updateFavoriteDto: UpdateTattooFavoriteDto,
  ): Promise<void> {
    await this.updateTattooFavoriteUseCase.execute(
      {
        designId: updateFavoriteDto.designId,
        isFavorite: updateFavoriteDto.isFavorite,
      },
      this.requestContextService.getContext(),
    );
  }
}
