import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../../global/infrastructure/base.handler';
import { CreateUserByTypeParams } from '../../../users/usecases/user/interfaces/createUserByType.params';
import { IUser } from '../../domain/models/user.model';
import { CreateUserByTypeUseCase } from '../../usecases/user/createUserByType.usecase';
import { SendSMSVerificationCodeUseCase } from '../../usecases/user/sendSMSVerificationCode.usecase';
import { CreateUserReqDto } from '../dtos/createUserReq.dto';
import { SendVerificationCodeQueryDto } from '../dtos/SendVerificationCodeQuery.dto';
import { VerificationType } from '../entities/verificationHash.entity';

@Injectable()
export class UsersHandler extends BaseHandler {
  constructor(
    private readonly createUserByTypeUseCase: CreateUserByTypeUseCase,
    private readonly sendSMSVerificationCodeUseCase: SendSMSVerificationCodeUseCase,
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
}
