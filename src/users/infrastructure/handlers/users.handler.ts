import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DomainException } from "src/global/domain/exceptions/domain.exception";
import { resolveDomainException } from "src/global/infrastructure/exceptions/resolveDomainException";
import { CreateUserByTypeParams } from "src/users/usecases/user/interfaces/createUserByType.params";
import { IUser } from "../../domain/models/user.model";
import { CreateUserByTypeUseCase } from "../../usecases/user/crerateUserByType.usecase";
import { CreateUserReqDto } from "../dtos/createUserReq.dto";


@Injectable()
export class UsersHandler {
  constructor(
    private readonly createUserByTypeUseCase: CreateUserByTypeUseCase,
    private readonly configService: ConfigService,
  ) {}

  async handleCreate(dto: CreateUserReqDto): Promise<IUser> {
    const result = await this.createUserByTypeUseCase.execute(dto as CreateUserByTypeParams);
    if(result instanceof DomainException) {
      throw resolveDomainException(result);
    }

    return result;
  }
    
}
