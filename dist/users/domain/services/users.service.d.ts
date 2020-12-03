import { User } from '../../infrastructure/entities/user.entity';
import { Repository, FindManyOptions, DeepPartial, FindOneOptions, DeleteResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../infrastructure/entities/role.entity';
import { CreateUserByTypeParams } from 'src/users/usecases/user/interfaces/createUserByType.params';
import { IUser } from '../models/user.model';
export declare class UsersService {
    private readonly usersRepository;
    private readonly configService;
    constructor(usersRepository: Repository<User>, configService: ConfigService);
    create(createUserParams: CreateUserByTypeParams, role: Role): Promise<IUser | boolean>;
    findById(id: number): Promise<User>;
    findByType(type: string, identifier: string): Promise<User>;
    find(options: FindManyOptions<User>): Promise<User[]>;
    findOne(options?: FindOneOptions<User>): Promise<User | undefined>;
    delete(id: number): Promise<DeleteResult>;
    findAndCount(options: FindManyOptions<User>): Promise<[User[], number]>;
    edit(id: number, update: DeepPartial<User> | User): Promise<User>;
    hashPasword(password: string): Promise<string>;
    validatePassword(incomingPassword: string, databaseUserPassword: string): Promise<boolean>;
}
