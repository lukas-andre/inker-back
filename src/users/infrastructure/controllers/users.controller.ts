import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { ActivateUserByEmailReqDto } from '../dtos/activateUserByEmail.dto';
import { ActivateUserWithSecretReqDto } from '../dtos/activateUserWithSecret.dto';
import { CreateUserReqDto } from '../dtos/createUserReq.dto';
import { DeleteUserReqDto } from '../dtos/deleteUser.dto';
import { GetForgotPasswordCodeQueryDto } from '../dtos/getForgotPasswordCodeQuery.dto';
import { SendAccountVerificationCodeQueryDto } from '../dtos/sendAccountVerificationCodeQuery.dto';
import { SendForgotPasswordCodeReqDto } from '../dtos/sendForgotPasswordCodeReq.dto';
import { UpdateUserEmailReqDto } from '../dtos/updateUserEmailReq.dto';
import { UpdateUserPasswordQueryDto } from '../dtos/updateUserPasswordQuery.dto';
import { UpdateUserPasswordReqDto } from '../dtos/updateUserPasswordReq.dto';
import { UpdateUserUsernameReqDto } from '../dtos/updateUserUsernameReq.dto';
import { ValidateAccountVerificationCodeQueryDto } from '../dtos/validateAccountVerificationCodeQuery.dto';
import { UsersHandler } from '../handlers/users.handler';
import { UserIdPipe } from '../pipes/userId.pipe';

import { ActivateUserByEmailDoc } from './docs/activateUserByEmail.doc';
import { ActivateUserWithSecretDoc } from './docs/activateUserWithSecret.doc';
import { DeleteUserDoc } from './docs/deleteUser.doc';
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
    @Param('userId', UserIdPipe) userId: string,
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
    @Param('userId', UserIdPipe) userId: string,
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
    @Param('userId', UserIdPipe) userId: string,
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
    @Param('userId', UserIdPipe) userId: string,
    @Query() getForgotPasswordCodeQueryDto: GetForgotPasswordCodeQueryDto,
  ) {
    return this.usersHandler.handleGetForgotPasswordCode(
      userId,
      getForgotPasswordCodeQueryDto,
    );
  }

  @GetForgotPasswordCode()
  @HttpCode(200)
  @Post('send-forgot-password-code')
  async sendForgotPasswordCode(
    @Query() sendForgotPasswordCodeReqDto: SendForgotPasswordCodeReqDto,
  ) {
    return this.usersHandler.handleSendAccountForgotPasswordCode(
      sendForgotPasswordCodeReqDto,
    );
  }

  // TODO: move this to notification module
  @SendAccountVerificationCodeDoc()
  @HttpCode(200)
  @Post(':userId/send-account-verification-code')
  async sendAccountValidationCode(
    @Param('userId', UserIdPipe) userId: string,
    @Query()
    sendAccountVerificationCodeQueryDto: SendAccountVerificationCodeQueryDto,
  ) {
    this.logger.log({ sendAccountVerificationCodeQueryDto });
    return this.usersHandler.handleSendAccountValidationCode(
      userId,
      sendAccountVerificationCodeQueryDto,
    );
  }

  @SendAccountVerificationCodeDoc()
  @HttpCode(200)
  @Post('send-account-verification-code')
  async sendAccountValidationCodeWithPhoneNumberOrEmail(
    @Query()
    sendAccountVerificationCodeQueryDto: SendAccountVerificationCodeQueryDto,
  ) {
    this.logger.log({ sendAccountVerificationCodeQueryDto });
    return this.usersHandler.handleSendAccountValidationCodeWithPhoneNumberOrEmail(
      sendAccountVerificationCodeQueryDto,
    );
  }

  @ValidateAccountVerificationCodeDoc()
  @HttpCode(200)
  @Post(':userId/validate-account-verification-code/:code')
  async validateAccountVerificationCode(
    @Param('userId', UserIdPipe) userId: string,
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

  @ValidateAccountVerificationCodeDoc()
  @HttpCode(200)
  @Post('forgot-password/:code')
  async validateForgotPasswordCode(
    @Param('code') code: string,
    @Body() updateUserPasswordReqDto: UpdateUserPasswordReqDto,
  ) {
    return this.usersHandler.updatePasswordWithCode(
      code,
      updateUserPasswordReqDto.password,
      updateUserPasswordReqDto.repeatedPassword,
      updateUserPasswordReqDto.email,
    );
  }

  @DeleteUserDoc()
  @HttpCode(200)
  @Delete('me')
  @UseGuards(AuthGuard)
  async deleteMe(@Body() deleteUserReqDto: DeleteUserReqDto) {
    return this.usersHandler.handleDeleteMe(deleteUserReqDto);
  }

  @ActivateUserWithSecretDoc()
  @HttpCode(200)
  @Post(':userId/activate')
  async activateUserWithSecret(
    @Param('userId', UserIdPipe) userId: string,
    @Body() activateUserWithSecretReqDto: ActivateUserWithSecretReqDto,
  ) {
    return this.usersHandler.handleActivateUserWithSecret(
      userId,
      activateUserWithSecretReqDto,
    );
  }

  @ActivateUserByEmailDoc()
  @HttpCode(200)
  @Post('activate-by-email')
  async activateUserByEmail(
    @Body() activateUserByEmailReqDto: ActivateUserByEmailReqDto,
  ) {
    return this.usersHandler.handleActivateUserByEmail(
      activateUserByEmailReqDto,
    );
  }
}
