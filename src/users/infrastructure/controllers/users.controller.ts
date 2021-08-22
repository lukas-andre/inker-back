import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggingInterceptor } from '../../../global/aspects/logging.interceptor';
import { CreateUserReqDto } from '../dtos/createUserReq.dto';
import { SendVerificationCodeQueryDto } from '../dtos/sendVerificationCodeQuery.dto';
import { ValidateVerificationCodeQueryDto } from '../dtos/ValidateVerificationCodeQuery.dto';
import { UsersHandler } from '../handlers/users.handler';
import { UserIdPipe } from '../pipes/userId.pipe';
import {
  CreateUserDoc,
  SendVerificationCodeDoc,
  ValidateVerificationCodeDoc,
} from './docs/users.doc';

@ApiTags('users')
@Controller('users')
@UseInterceptors(LoggingInterceptor)
export class UsersController {
  private logger = new Logger(UsersController.name);

  constructor(private readonly usersHandler: UsersHandler) {}

  @CreateUserDoc()
  @Post()
  async create(@Body() createUserDto: CreateUserReqDto) {
    return this.usersHandler.handleCreate(createUserDto);
  }

  @SendVerificationCodeDoc()
  @HttpCode(200)
  @Post(':userId/send-verification-code')
  async sendValidationCode(
    @Param('userId', UserIdPipe) userId: number,
    @Query() sendVerificationCodeQueryDto: SendVerificationCodeQueryDto,
  ) {
    this.logger.log({ sendVerificationCodeQueryDto });
    return this.usersHandler.handleSendValidationCode(
      userId,
      sendVerificationCodeQueryDto,
    );
  }

  @ValidateVerificationCodeDoc()
  @HttpCode(200)
  @Post(':userId/validate-verification-code/:code')
  async validateVerificationCode(
    @Param('userId', UserIdPipe) userId: number,
    @Param('code') code: string,
    @Query() { type }: ValidateVerificationCodeQueryDto,
  ) {
    return this.usersHandler.handleValidateVerificationCode(userId, code, type);
  }
}
