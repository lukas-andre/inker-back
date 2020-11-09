import { CreateUserDto } from '../dtos/createUser.dto';
import { UsersHandler } from '../handlers/users.handler';
export declare class UsersController {
    private readonly usersHandler;
    constructor(usersHandler: UsersHandler);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        active: boolean;
        userType: import("../enums/userType.enum").UserType;
        role: import("../entities/role.entity").Role;
        created_at: Date;
        updated_at: Date;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }>;
}
