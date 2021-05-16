import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  DeepPartial,
  FindOneOptions,
  DeleteResult,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LoginType } from '../../../auth/domain/enums/loginType.enum';
import { Role } from '../../infrastructure/entities/role.entity';
import { IUser } from '../models/user.model';
import { User } from '../../infrastructure/entities/user.entity';
import { CreateUserByTypeParams } from '../../../users/usecases/user/interfaces/createUserByType.params';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { hash, compare } from 'bcryptjs';
import { UserType } from '../enums/userType.enum';
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

    const user = this.usersRepository.create();
    user.username = createUserParams.username;
    user.userType = createUserParams.userType;
    user.email = createUserParams.email;
    (user.password = await this.hashPasword(createUserParams.password)),
      (user.role = role);

    const { password, ...result } = await this.usersRepository.save(user);
    return result as IUser;
  }

  async findById(id: number) {
    return this.usersRepository.findOne(id);
  }

  async findByType(type: string, identifier: string) {
    return this.findOne({
      relations: ['role', 'role.permissions'],
      where: { [String(LoginType[type]).toLocaleLowerCase()]: identifier },
    });
  }

  async exists(userId: number): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.id = $1)`,
      [userId],
    );
    return result.pop().exists;
  }

  async existsArtist(userId: number): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.id = $1 AND u."userType" = $2)`,
      [userId, UserType.ARTIST],
    );
    return result.pop().exists;
  }

  async find(options: FindManyOptions<User>) {
    return this.usersRepository.find(options);
  }

  async findOne(options?: FindOneOptions<User>): Promise<User | undefined> {
    return this.usersRepository.findOne(options);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.usersRepository.delete(id);
  }

  async findAndCount(
    options: FindManyOptions<User>,
  ): Promise<[User[], number]> {
    return this.usersRepository.findAndCount(options);
  }

  async edit(id: number, update: DeepPartial<User> | User): Promise<User> {
    return this.usersRepository.save(
      Object.assign(await this.findById(id), update),
    );
  }

  async hashPasword(password: string): Promise<string> {
    return hash(password, this.configService.get('auth.saltLength'));
  }

  async validatePassword(
    incomingPassword: string,
    databaseUserPassword: string,
  ): Promise<boolean> {
    return compare(incomingPassword, databaseUserPassword);
  }
}
