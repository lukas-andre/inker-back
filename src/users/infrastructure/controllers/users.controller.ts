import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggingInterceptor } from '../../../global/aspects/logging.interceptor';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { CreateUserReqDto } from '../dtos/createUserReq.dto';
import { GetForgotPasswordCodeQueryDto } from '../dtos/getForgotPasswordCodeQuery.dto';
import { SendAccountVerificationCodeQueryDto } from '../dtos/sendAccountVerificationCodeQuery.dto';
import { UpdateUserEmailReqDto } from '../dtos/updateUserEmailReq.dto';
import { UpdateUserPasswordQueryDto } from '../dtos/updateUserPasswordQuery.dto';
import { UpdateUserPasswordReqDto } from '../dtos/updateUserPasswordReq.dto';
import { UpdateUserUsernameReqDto } from '../dtos/updateUserUsernameReq.dto';
import { ValidateAccountVerificationCodeQueryDto } from '../dtos/validateAccountVerificationCodeQuery.dto';
import { UsersHandler } from '../handlers/users.handler';
import { UserIdPipe } from '../pipes/userId.pipe';
import { GetForgotPasswordCode } from './docs/getForgotPasswordCode.doc';
import { UpdateUserPasswordDoc } from './docs/updateUserPassword.doc';
import { UpdateUserUsernameDoc } from './docs/updateUserUsername.doc';
import {
  CreateUserDoc,
  SendAccountVerificationCodeDoc,
  UpdateUserEmailDoc,
  ValidateAccountVerificationCodeDoc,
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

  @UpdateUserEmailDoc()
  @HttpCode(200)
  @Put(':userId/email')
  async updateUserEmail(
    @Param('userId', UserIdPipe) userId: number,
    @Body() updateUserEmailReqDto: UpdateUserEmailReqDto,
  ) {
    return this.usersHandler.handleUpdateUserEmail(
      userId,
      updateUserEmailReqDto,
    );
  }

  @UpdateUserUsernameDoc()
  @HttpCode(200)
  @Put(':userId/username')
  async updateUserUsername(
    @Param('userId', UserIdPipe) userId: number,
    @Body() updateUserUsernameReqDto: UpdateUserUsernameReqDto,
  ) {
    return this.usersHandler.handleUpdateUserUsername(
      userId,
      updateUserUsernameReqDto,
    );
  }

  @UpdateUserPasswordDoc()
  @HttpCode(200)
  @Put(':userId/password/:code')
  async updateUserPassword(
    @Param('userId', UserIdPipe) userId: number,
    @Param('code') code: string,
    @Query() updateUserPasswordQueryDto: UpdateUserPasswordQueryDto,
    @Body() updateUserPasswordReqDto: UpdateUserPasswordReqDto,
  ) {
    return this.usersHandler.handleUpdateUserPassword(
      userId,
      code,
      updateUserPasswordQueryDto,
      updateUserPasswordReqDto,
    );
  }

  @GetForgotPasswordCode()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Get(':userId/forgot-password-code')
  async getForgotPasswordCode(
    @Param('userId', UserIdPipe) userId: number,
    @Query() getForgotPasswordCodeQueryDto: GetForgotPasswordCodeQueryDto,
  ) {
    return this.usersHandler.handleGetForgotPasswordCode(
      userId,
      getForgotPasswordCodeQueryDto,
    );
  }

  // TODO: move this to notification module
  @SendAccountVerificationCodeDoc()
  @HttpCode(200)
  @Post(':userId/send-account-verification-code')
  async sendAccountValidationCode(
    @Param('userId', UserIdPipe) userId: number,
    @Query()
    sendAccountVerificationCodeQueryDto: SendAccountVerificationCodeQueryDto,
  ) {
    this.logger.log({ sendAccountVerificationCodeQueryDto });
    return this.usersHandler.handleSendAccountValidationCode(
      userId,
      sendAccountVerificationCodeQueryDto,
    );
  }

  @ValidateAccountVerificationCodeDoc()
  @HttpCode(200)
  @Post(':userId/validate-account-verification-code/:code')
  async validateAccountVerificationCode(
    @Param('userId', UserIdPipe) userId: number,
    @Param('code') code: string,
    @Query()
    { notificationType }: ValidateAccountVerificationCodeQueryDto,
  ) {
    return this.usersHandler.handleValidateAccountVerificationCode(
      userId,
      code,
      notificationType,
    );
  }
}
