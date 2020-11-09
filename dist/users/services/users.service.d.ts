import { CreateUserDto } from '../dtos/createUser.dto';
import { User } from '../entities/user.entity';
import { Repository, FindManyOptions, DeepPartial, FindOneOptions, DeleteResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Role } from '../entities/role.entity';
export declare class UsersService {
    private readonly usersRepository;
    private readonly configService;
    constructor(usersRepository: Repository<User>, configService: ConfigService);
    create(createUserDto: CreateUserDto, role: Role): Promise<false | {
        id: string;
        username: string;
        email: string;
        active: boolean;
        userType: import("../enums/userType.enum").UserType;
        role: Role;
        created_at: Date;
        updated_at: Date;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }>;
    findById(id: string): Promise<User>;
    findByType(type: string, identifier: string): Promise<User>;
    find(options: FindManyOptions<User>): Promise<User[]>;
    findOne(options?: FindOneOptions<User>): Promise<User | undefined>;
    delete(id: string): Promise<DeleteResult>;
    findAndCount(options: FindManyOptions<User>): Promise<[User[], number]>;
    edit(id: string, update: DeepPartial<User> | User): Promise<User>;
    hashPasword(password: string): Promise<string>;
    validatePassword(incomingPassword: string, databaseUserPassword: string): Promise<boolean>;
}
