import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../infrastructure/entities/user.entity';
import {
  Repository,
  FindManyOptions,
  DeepPartial,
  FindOneOptions,
  DeleteResult,
} from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { LoginType } from '../../../auth/domain/enums/loginType.enum';
import { Role } from '../../infrastructure/entities/role.entity';
import { CreateUserByTypeParams } from 'src/users/usecases/user/interfaces/createUserByType.params';
import { IUser } from '../models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'user-db')
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createUserParams: CreateUserByTypeParams,
    role: Role,
  ): Promise<IUser | boolean> {
    const exists: number = await this.usersRepository.count({
      where: [
        { username: createUserParams.username },
        { email: createUserParams.email },
      ],
    });

    if (exists) {
      return false;
    }

    const newUser = Object.assign(new User(), {
      ...createUserParams,
      password: await this.hashPasword(createUserParams.password),
      role,
    });

    const { password, ...result } = await this.usersRepository.save(newUser);
    return result as IUser;
  }

  async findById(id: number) {
    return await this.usersRepository.findOne(id);
  }

  async findByType(type: string, identifier: string) {
    return this.findOne({
      relations: ['role', 'role.permissions'],
      where: { [String(LoginType[type]).toLocaleLowerCase()]: identifier },
    });
  }

  async find(options: FindManyOptions<User>) {
    return await this.usersRepository.find(options);
  }

  async findOne(options?: FindOneOptions<User>): Promise<User | undefined> {
    return await this.usersRepository.findOne(options);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.usersRepository.delete(id);
  }

  async findAndCount(
    options: FindManyOptions<User>,
  ): Promise<[User[], number]> {
    return await this.usersRepository.findAndCount(options);
  }

  async edit(id: number, update: DeepPartial<User> | User): Promise<User> {
    return await this.usersRepository.save(
      Object.assign(await this.findById(id), update),
    );
  }

  async hashPasword(password: string): Promise<string> {
    return await hash(password, this.configService.get('auth.saltLength'));
  }

  async validatePassword(
    incomingPassword: string,
    databaseUserPassword: string,
  ): Promise<boolean> {
    return await compare(incomingPassword, databaseUserPassword);
  }
}
