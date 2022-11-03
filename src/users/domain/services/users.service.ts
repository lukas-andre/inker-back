import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { LoginType } from '../../../auth/domain/enums/loginType.enum';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import {
  DbServiceBadRule,
  DBServiceUpdateException,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { Role } from '../../infrastructure/entities/role.entity';
import { User } from '../../infrastructure/entities/user.entity';
import { CreateUserByTypeParams } from '../../usecases/user/interfaces/createUserByType.params';
import { UserType } from '../enums/userType.enum';
import { ERROR_ACTIVATING_USER, USER_ALREADY_EXISTS } from '../errors/codes';
import { UserInterface } from '../models/user.model';
@Injectable()
export class UsersService extends BaseComponent {
  constructor(
    @InjectRepository(User, 'user-db')
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    super(UsersService.name);
  }

  async create(
    createUserParams: CreateUserByTypeParams,
    role: Role,
  ): Promise<UserInterface> {
    const exists = await this.existsByUsernameAndEmail(
      createUserParams.email,
      createUserParams.username,
    );

    if (exists) {
      throw new DbServiceBadRule(this, USER_ALREADY_EXISTS);
    }

    const user = this.usersRepository.create();
    user.username = createUserParams.username;
    user.userType = createUserParams.userType;
    user.email = createUserParams.email.toLowerCase();
    user.password = await this.hashPassword(createUserParams.password);
    user.role = role;

    const { password, ...result } = await this.usersRepository.save(user);

    return result as UserInterface;
  }

  async findById(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByType(type: string, identifier: string) {
    return this.findOne({
      relations: ['role', 'role.permissions'],
      where: { [String(LoginType[type]).toLocaleLowerCase()]: identifier },
    });
  }

  async existsByUsernameAndEmail(
    email: string,
    username: string,
  ): Promise<boolean> {
    const result: ExistsQueryResult[] = await this.usersRepository.query(
      'SELECT EXISTS(SELECT 1 FROM public.user WHERE email = $1 AND username = $2)',
      [email, username],
    );
    return result.pop().exists;
  }

  async exists(userId: number): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.id = $1)`,
      [userId],
    );
    return result.pop().exists;
  }

  async existsAndIsValid(userId: number): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.id = $1 AND u.active = $2)`,
      [userId, true],
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

  async activate(userId: number) {
    try {
      const result = await this.usersRepository
        .createQueryBuilder()
        .update(User)
        .set({
          active: true,
        })
        .where('id = :userId', { userId })
        .execute();
      if (result.affected === 0) {
        throw new DBServiceUpdateException(
          this,
          `${ERROR_ACTIVATING_USER} no user is found`,
        );
      }
      return result;
    } catch (error) {
      throw new DBServiceUpdateException(
        this,
        `${ERROR_ACTIVATING_USER} ${userId}`,
        error,
      );
    }
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

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.configService.get('auth.saltLength'));
  }

  async validatePassword(
    incomingPassword: string,
    databaseUserPassword: string,
  ): Promise<boolean> {
    return compare(incomingPassword, databaseUserPassword);
  }
}
