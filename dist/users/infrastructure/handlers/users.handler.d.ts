import { ConfigService } from '@nestjs/config';
import { IUser } from '../../domain/models/user.model';
import { CreateUserByTypeUseCase } from '../../usecases/user/crerateUserByType.usecase';
import { CreateUserReqDto } from '../dtos/createUserReq.dto';
export declare class UsersHandler {
    private readonly createUserByTypeUseCase;
    private readonly configService;
    constructor(createUserByTypeUseCase: CreateUserByTypeUseCase, configService: ConfigService);
    handleCreate(dto: CreateUserReqDto): Promise<IUser>;
}
