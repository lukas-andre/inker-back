import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../../global/infrastructure/base.handler';
import { CreateUserByTypeParams } from '../../../users/usecases/user/interfaces/createUserByType.params';
import { IUser } from '../../domain/models/user.model';
import { CreateUserByTypeUseCase } from '../../usecases/user/createUserByType.usecase';
import { SendSMSVerificationCodeUseCase } from '../../usecases/user/sendSMSVerificationCode.usecase';
import { ValidateSMSVerificationCodeUseCase } from '../../usecases/user/validateSMSVerificationCode.usecase';
import { CreateUserReqDto } from '../dtos/createUserReq.dto';
import { SendVerificationCodeQueryDto } from '../dtos/sendVerificationCodeQuery.dto';
import { VerificationType } from '../entities/verificationHash.entity';

@Injectable()
export class UsersHandler extends BaseHandler {
  constructor(
    private readonly createUserByTypeUseCase: CreateUserByTypeUseCase,
    private readonly sendSMSVerificationCodeUseCase: SendSMSVerificationCodeUseCase,
    private readonly validateSMSVerificationCodeUseCase: ValidateSMSVerificationCodeUseCase,
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
  public async handleSendValidationCode(
    userId: number,
    query: SendVerificationCodeQueryDto,
  ) {
    console.log({ userId });
    console.log({ query });

    switch (query.type) {
      case VerificationType.SMS:
        console.log('entre');
        return this.resolve(
          await this.sendSMSVerificationCodeUseCase.execute(
            userId,
            query.phoneNumber,
          ),
        );
      case VerificationType.EMAIL:
        // TODO: IMPLEMENT EMAIL VERIFICATION TOKEN USE CASE
        break;
    }
  }

  public async handleValidateVerificationCode(
    userId: number,
    code: string,
    type: VerificationType,
  ) {
    switch (type) {
      case VerificationType.EMAIL:
        throw new Error('Function not implemented.');

      case VerificationType.SMS:
        return this.resolve(
          await this.validateSMSVerificationCodeUseCase.execute(userId, code),
        );
    }
  }
}
