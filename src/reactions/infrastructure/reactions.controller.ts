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
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReactionsHandler } from './reactions.handler';
import { ReactionToActivityResponseDto } from './reactionToActivityResponse.dto';
import { ReactionToActivityDto } from './reactionToActivity.dto';

@ApiTags('reactions')
@Controller('reactions')
export class ReactionsController {
  private readonly logger = new Logger(ReactionsController.name);
  constructor(private readonly reactionsHandler: ReactionsHandler) {}

  @ApiOperation({ summary: 'Add Like to activity' })
  @ApiOkResponse({
    description: 'Add like ok',
    type: ReactionToActivityResponseDto,
  })
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
}
