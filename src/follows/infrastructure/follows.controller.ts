import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FollowerDto } from '../../artists/infrastructure/dtos/follow.dto';
import { FollowsHandler } from './follows.handler';

@ApiTags('follow')
@Controller('follow')
export class FollowsController {
  constructor(private readonly followsHandler: FollowsHandler) {}

  @ApiOperation({ summary: 'Add follow' })
  @ApiOkResponse({
    description: 'Follow ok',
    type: Boolean,
  })
  @ApiParam({ name: 'userId', required: true, type: Number })
  @Post(':userId')
  async follow(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() request,
  ) {
    return this.followsHandler.handleFollow(userId, request);
  }

  @ApiOperation({ summary: 'Unfollow' })
  @ApiOkResponse({
    description: 'Unfollow ok',
    type: Boolean,
  })
  @ApiParam({ name: 'userId', required: true, type: Number })
  @Post(':userId/unfollow')
  async unfollow(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() request,
  ) {
    return this.followsHandler.handleUnfollow(userId, request);
  }

  @ApiOperation({ summary: 'Find artist followers' })
  @ApiOkResponse({
    description: 'Find followers ok',
    type: FollowerDto,
    isArray: true,
  })
  @ApiParam({ name: 'userId', required: true, type: Number })
  @Get(':userId/followers')
  async findArtistFollowers(@Param('userId', ParseIntPipe) userId: number) {
    return this.followsHandler.handleFindArtistFollowers(userId);
  }

  @ApiOperation({ summary: 'Find artist follows' })
  @ApiOkResponse({
    description: 'Find follows ok',
    type: FollowerDto,
    isArray: true,
  })
  @ApiParam({ name: 'userId', required: true, type: Number })
  @Get(':userId/follows')
  async findArtistFollows(@Param('userId', ParseIntPipe) userId: number) {
    return this.followsHandler.findArtistFollows(userId);
  }
}
