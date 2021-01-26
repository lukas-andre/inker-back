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
import { CreateCommentDto } from '../dtos/createComment.dto';
import { CommentsHandler } from '../handlers/comments.handler';

@ApiTags('comment')
@Controller('comment')
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);
  constructor(private readonly commentsHandler: CommentsHandler) {}

  @ApiOperation({ summary: 'Add Comment' })
  @ApiOkResponse({
    description: 'Add comment ok',
    type: Boolean,
  })
  @Post()
  async cretePost(
    @Ip() ip: string,
    @HostParam() host: any,
    @Request() request,
    @Body() body: CreateCommentDto,
  ) {
    this.logger.log(`IP: ${ip}`);
    this.logger.log(`Host: ${JSON.stringify(host)}`);
    return this.commentsHandler.handleCreateComment(body, request);
  }
}
