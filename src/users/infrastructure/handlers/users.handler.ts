import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { BaseHandler } from '../../../global/infrastructure/base.handler';
import { CreateUserByTypeUseCase } from '../../usecases/user/createUserByType.usecase';
import { CreateUserByTypeParams } from '../../usecases/user/interfaces/createUserByType.params';
import { SendSMSAccountVerificationCodeUseCase } from '../../usecases/user/sendSMSAccountVerificationCode.usecase';
import { SendSMSForgotPasswordCodeUseCase } from '../../usecases/user/sendSMSForgotPasswordCode.usecase';
import { UpdateUserEmailUseCase } from '../../usecases/user/updateUserEmail.usecase';
import { UpdateUserPasswordUseCase } from '../../usecases/user/updateUserPassword.usecase';
import { UpdateUserUsernameUseCase } from '../../usecases/user/updateUserUsername.usecase';
import { ValidateSMSAccountVerificationCodeUseCase } from '../../usecases/user/validateSMSAccountVerificationCode.usecase';
import { CreateUserReqDto } from '../dtos/createUserReq.dto';
import { GetForgotPasswordCodeQueryDto } from '../dtos/getForgotPasswordCodeQuery.dto';
import { SendAccountVerificationCodeQueryDto } from '../dtos/sendAccountVerificationCodeQuery.dto';
import { UpdateUserEmailReqDto } from '../dtos/updateUserEmailReq.dto';
import { UpdateUserPasswordQueryDto } from '../dtos/updateUserPasswordQuery.dto';
import { UpdateUserPasswordReqDto } from '../dtos/updateUserPasswordReq.dto';
import { UpdateUserUsernameReqDto } from '../dtos/updateUserUsernameReq.dto';
import { NotificationType } from '../entities/verificationHash.entity';
import { DeleteUserReqDto } from '../dtos/deleteUser.dto';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { DeleteUserUseCase } from '../../usecases/user/deleteUser.usecase';
import { SendSMSVerificationCodeUseCase } from '../../usecases/user/verification-code/sendSmsVerificationCode.usecase';
import { SendEmailVerificationCodeUseCase } from '../../usecases/user/verification-code/sendEmailVerificationCode.usecase';
import { SendForgotPasswordCodeReqDto } from '../dtos/sendForgotPasswordCodeReq.dto';
import { SendForgotPasswordCodeUseCase } from '../../usecases/user/sendForgotPasswordCode.usecase';
import { UpdateUserPasswordWithCodeUseCase } from '../../usecases/user/updateUserPasswordWithCode.usecase';

@Injectable()
export class UsersHandler extends BaseHandler {


  constructor(
    private readonly createUserByTypeUseCase: CreateUserByTypeUseCase,
    private readonly sendSMSAccountVerificationCodeUseCase: SendSMSAccountVerificationCodeUseCase,
    private readonly sendSMSForgotPasswordCodeUseCase: SendSMSForgotPasswordCodeUseCase,
    private readonly validateSMSAccountVerificationCodeUseCase: ValidateSMSAccountVerificationCodeUseCase,
    private readonly updateUserEmailUseCase: UpdateUserEmailUseCase,
    private readonly updateUserUsernameUseCase: UpdateUserUsernameUseCase,
    private readonly updateUserPasswordUseCase: UpdateUserPasswordUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly sendSMSVerificationCodeUseCase: SendSMSVerificationCodeUseCase,
    private readonly sendEmailVerificationCodeUseCase: SendEmailVerificationCodeUseCase,
    private readonly sendForgotPasswordCodeUseCase: SendForgotPasswordCodeUseCase,
    private readonly updateUserPasswordWithCodeUseCase: UpdateUserPasswordWithCodeUseCase,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly requestContext: RequestContextService,
  ) {
    super(jwtService);
  }

  public async handleCreate(dto: CreateUserReqDto): Promise<any> {
    return this.createUserByTypeUseCase.execute(dto as CreateUserByTypeParams);
  }

  public async handleUpdateUserEmail(
    userId: number,
    dto: UpdateUserEmailReqDto,
  ) {
    return this.updateUserEmailUseCase.execute(userId, dto.email);
  }

  public async handleUpdateUserUsername(
    userId: number,
    dto: UpdateUserUsernameReqDto,
  ) {
    return this.updateUserUsernameUseCase.execute(userId, dto.username);
  }

  public async handleUpdateUserPassword(
    userId: number,
    code: string,
    query: UpdateUserPasswordQueryDto,
    dto: UpdateUserPasswordReqDto,
  ) {
    return this.updateUserPasswordUseCase.execute(
      userId,
      code,
      query.notificationType,
      dto.password,
      dto.repeatedPassword,
    );
  }

  public async handleGetForgotPasswordCode(
    userId: number,
    query: GetForgotPasswordCodeQueryDto,
  ) {
    switch (query.notificationType) {
      case NotificationType.EMAIL:
        throw Error('Not implemented');
      case NotificationType.SMS:
        return this.sendSMSForgotPasswordCodeUseCase.execute(
          userId,
          query.phoneNumber,
        );
    }
  }

  public async handleSendAccountValidationCode(
    userId: number,
    query: SendAccountVerificationCodeQueryDto,
  ) {
    switch (query.notificationType) {
      case NotificationType.SMS:
        return this.sendSMSAccountVerificationCodeUseCase.execute(
          userId,
          query.phoneNumber,
        );
      case NotificationType.EMAIL:
        return this.sendEmailVerificationCodeUseCase.execute(
          query.email,
        );
    }
  }

  public async handleSendAccountValidationCodeWithPhoneNumberOrEmail(
    query: SendAccountVerificationCodeQueryDto,
  ) {
    switch (query.notificationType) {
      case NotificationType.SMS:
        return this.sendSMSVerificationCodeUseCase.execute(
          query.phoneNumber,
        );
      case NotificationType.EMAIL:
        return this.sendEmailVerificationCodeUseCase.execute(
          query.email,
        );
    }
  }


  public async handleValidateAccountVerificationCode(
    userId: number,
    code: string,
    type: NotificationType,
  ) {
    switch (type) {
      case NotificationType.EMAIL:
        throw new Error('Function not implemented.');

      case NotificationType.SMS:
        return this.validateSMSAccountVerificationCodeUseCase.execute(
          userId,
          code,
        );
    }
  }

  public async handleSendAccountForgotPasswordCode(dto: SendForgotPasswordCodeReqDto) {
    return this.sendForgotPasswordCodeUseCase.execute(
      dto
    );
  }

  public async updatePasswordWithCode(code: string, password: string, newPassword: string, email?: string) {
    return this.updateUserPasswordWithCodeUseCase.execute(code, email, password, newPassword);
  }


  public async handleDeleteMe(dto: DeleteUserReqDto) {
    const { userId } = this.requestContext
    return this.deleteUserUseCase.execute(userId, dto.password);
  }
}
