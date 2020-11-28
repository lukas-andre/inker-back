import { CreateUserReqDto } from '../dtos/createUserReq.dto';
import { UsersHandler } from '../handlers/users.handler';
export declare class UsersController {
    private readonly usersHandler;
    constructor(usersHandler: UsersHandler);
    create(createUserDto: CreateUserReqDto): Promise<import("../../domain/models/user.model").IUser>;
}
