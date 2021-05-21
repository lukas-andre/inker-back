//TODO: ADD LIKE A POST
//TODO: ADD LIKE A COMENTARIO
import {
  Controller,
  Post,
  Request,
  Body,
  Ip,
  HostParam,
  Logger,
  Get,
  ParseIntPipe,
  Query,
  HttpCode,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { ReactionsHandler } from './reactions.handler';
import { ReactionToActivityResponseDto } from './reactionToActivityResponse.dto';
import { ReactionToActivityDto } from './reactionToActivity.dto';
import { ActivityTypeEnum } from './enums/activity.enum';

@ApiTags('reactions')
@Controller('reactions')
export class ReactionsController {
  private readonly logger = new Logger(ReactionsController.name);
  constructor(private readonly reactionsHandler: ReactionsHandler) {}

  @ApiOperation({ summary: 'Add Reaction to activity' })
  @ApiOkResponse({
    description: 'Add reaction ok',
    type: ReactionToActivityResponseDto,
  })
  @HttpCode(200)
  @Post()
  async likeActivity(
    @Ip() ip: string,
    @HostParam() host: any,
    @Request() request,
    @Body() body: ReactionToActivityDto,
  ): Promise<ReactionToActivityResponseDto> {
    this.logger.log(`IP: ${ip}`);
    this.logger.log(`Host: ${JSON.stringify(host)}`);
    return this.reactionsHandler.handleReaction(body, request);
  }

  @ApiOperation({ summary: 'Get reactions from activity' })
  @ApiOkResponse({
    description: 'Get reaction ok',
  })
  @ApiQuery({
    description: 'Activity id',
    name: 'activityId',
    required: true,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    description: 'Activity id',
    name: 'activity',
    required: true,
    enum: ActivityTypeEnum,
    example: ActivityTypeEnum.POST,
  })
  @Get()
  async getReactionsDetail(
    @Ip() ip: string,
    @HostParam() host: any,
    @Request() request,
    @Query('activityId', ParseIntPipe) activityId: number,
    @Query('activity') activity: string,
  ): Promise<any> {
    this.logger.log(`IP: ${ip}`);
    this.logger.log(`Host: ${JSON.stringify(host)}`);
    return this.reactionsHandler.handleGetReactionsDetail(
      activityId,
      activity,
      request,
    );
  }

  @ApiOperation({ summary: 'Get activities from activity' })
  @ApiOkResponse({
    description: 'Get activities ok',
  })
  @ApiQuery({
    description: 'Activity id',
    name: 'activityId',
    required: true,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    description: 'Activity id',
    name: 'activity',
    required: true,
    enum: ActivityTypeEnum,
    example: ActivityTypeEnum.POST,
  })
  @Get('resume')
  async getActivityReactionsResume(
    @Ip() ip: string,
    @HostParam() host: any,
    @Request() request,
    @Query('activityId', ParseIntPipe) activityId: number,
    @Query('activity') activity: string,
  ): Promise<any> {
    this.logger.log(`IP: ${ip}`);
    this.logger.log(`Host: ${JSON.stringify(host)}`);
    console.log('activityId: ', activityId);
    console.log('activity: ', activity);
    return this.reactionsHandler.handleGetActivityReactionsResume(
      activityId,
      activity,
      request,
    );
  }
}
