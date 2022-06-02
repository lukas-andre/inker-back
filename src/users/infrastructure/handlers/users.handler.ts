import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../../global/infrastructure/base.handler';
import { CreateUserByTypeParams } from '../../../users/usecases/user/interfaces/createUserByType.params';
import { IUser } from '../../domain/models/user.model';
import { CreateUserByTypeUseCase } from '../../usecases/user/createUserByType.usecase';
import { SendSMSAccountVerificationCodeUseCase } from '../../usecases/user/sendSMSAccountVerificationCode.usecase';
import { SendSMSForgotPasswordCodeUseCase } from '../../usecases/user/sendSMSForgotPasswordCode.usecas';
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
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  public async handleCreate(dto: CreateUserReqDto): Promise<IUser> {
    return this.resolve(
      await this.createUserByTypeUseCase.execute(dto as CreateUserByTypeParams),
    );
  }

  public async handleUpdateUserEmail(
    userId: number,
    dto: UpdateUserEmailReqDto,
  ) {
    return this.resolve(
      await this.updateUserEmailUseCase.execute(userId, dto.email),
    );
  }

  public async handleUpdateUserUsername(
    userId: number,
    dto: UpdateUserUsernameReqDto,
  ) {
    return this.resolve(
      await this.updateUserUsernameUseCase.execute(userId, dto.username),
    );
  }

  public async handleUpdateUserPassword(
    userId: number,
    code: string,
    query: UpdateUserPasswordQueryDto,
    dto: UpdateUserPasswordReqDto,
  ) {
    return this.resolve(
      await this.updateUserPasswordUseCase.execute(
        userId,
        code,
        query.notificationType,
        dto.password,
        dto.repeatedPassword,
      ),
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
        return this.resolve(
          await this.sendSMSForgotPasswordCodeUseCase.execute(
            userId,
            query.phoneNumber,
          ),
        );
    }
  }

  public async handleSendAccountValidationCode(
    userId: number,
    query: SendAccountVerificationCodeQueryDto,
  ) {
    switch (query.notificationType) {
      case NotificationType.SMS:
        return this.resolve(
          await this.sendSMSAccountVerificationCodeUseCase.execute(
            userId,
            query.phoneNumber,
          ),
        );
      case NotificationType.EMAIL:
        // TODO: IMPLEMENT EMAIL VERIFICATION TOKEN USE CASE
        break;
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
        return this.resolve(
          await this.validateSMSAccountVerificationCodeUseCase.execute(
            userId,
            code,
          ),
        );
    }
  }
}
