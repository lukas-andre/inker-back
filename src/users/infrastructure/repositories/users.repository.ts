import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import {
  DataSource,
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { LoginType } from '../../../auth/domain/enums/loginType.enum';
import { USER_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import {
  DBServiceUpdateException,
  DbServiceBadRule,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { UserType } from '../../domain/enums/userType.enum';
import {
  ERROR_ACTIVATING_USER,
  USER_ALREADY_EXISTS,
} from '../../domain/errors/codes';
import { UserInterface } from '../../domain/models/user.model';
import { CreateUserByTypeParams } from '../../usecases/user/interfaces/createUserByType.params';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';

export const userQueries = {
  findUserWithPermissionsByIdentifier: (fieldName: string) => `
    SELECT json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'phoneNumber', u.phone_number,
      'userType', u.user_type,
      'active', u.active,
      'permissions', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'c', p.controller,
              'a', p.action
            )
          )
          FROM role_permission rp 
          JOIN permission p ON p.id = rp."permissionId"
          WHERE rp."roleId" = u."roleId"
        ),
        '[]'::json
      )
    ) as user
    FROM public.user u
    WHERE u.${fieldName} = $1
  `,
  findUserForLogin: (type: LoginType) => `  
    SELECT json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'password', u.password,
      'userType', u.user_type,
      'active', u.active,
      'deletedAt', u.deleted_at,
      'createdAt', u.created_at,
      'updatedAt', u.updated_at,
      'permissions', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'controller', p.controller,
              'action', p.action
            )
          )
          FROM role_permission rp 
          JOIN permission p ON p.id = rp."permissionId"
          WHERE rp."roleId" = u."roleId"
        ),
        '[]'::json
      )
    ) as user
    FROM public.user u
    WHERE u.${String(LoginType[type]).toLowerCase()} = $1
  `,
  findById: `
    SELECT json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'phoneNumber', u.phone_number,
      'userType', u.user_type,
      'active', u.active,
      'deletedAt', u.deleted_at,
      'createdAt', u.created_at,
      'updatedAt', u.updated_at
    ) as user
    FROM public.user u
    WHERE u.id = $1
  `,
  findByIdWithPassword: `
    SELECT json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'password', u.password,
      'userType', u.user_type,
      'active', u.active,
      'deletedAt', u.deleted_at,
      'createdAt', u.created_at,
      'updatedAt', u.updated_at
    ) as user
    FROM public.user u
    WHERE u.id = $1
  `,
};

@Injectable()
export class UsersRepository extends BaseComponent {
  constructor(
    @InjectRepository(User, USER_DB_CONNECTION_NAME)
    private readonly usersRepository: Repository<User>,
    @InjectDataSource(USER_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    super(UsersRepository.name);
  }

  get source() {
    return this.dataSource;
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
    user.phoneNumber = createUserParams.phoneNumberDetails.number;
    user.role = role;

    const { password, ...result } = await this.usersRepository.save(user);

    return result as UserInterface;
  }

  async findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async softDelete(id: string) {
    return this.usersRepository.update(id, {
      active: false,
      deletedAt: new Date(),
    });
  }

  async findByLoginType(type: LoginType, identifier: string) {
    return this.source.query(userQueries.findUserForLogin(type), [identifier]);
  }

  async existsByUsernameAndEmail(
    email: string,
    username: string,
  ): Promise<boolean> {
    const [result]: ExistsQueryResult[] = await this.usersRepository.query(
      'SELECT EXISTS(SELECT 1 FROM public.user WHERE email = $1 AND username = $2)',
      [email, username],
    );
    return result.exists;
  }

  async exists(userId: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.id = $1)`,
      [userId],
    );
    return result.exists;
  }

  async existsAndIsActive(userId: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.id = $1 AND u.active = $2)`,
      [userId, true],
    );
    return result.exists;
  }

  async existsByEmail(email: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.email = $1)`,
      [email],
    );
    return result.exists;
  }

  async existsByUsername(username: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.username = $1)`,
      [username],
    );
    return result.exists;
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.phone_number = $1)`,
      [phoneNumber],
    );
    return result.exists;
  }

  async existsArtist(userId: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.usersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM public.user u WHERE u.id = $1 AND u."user_type" = $2)`,
      [userId, UserType.ARTIST],
    );
    return result.exists;
  }

  async activate(userId: string) {
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
      throw new DBServiceUpdateException(this, error instanceof Error ? error.message : String(error));
    }
  }

  async find(options: FindManyOptions<User>) {
    return this.usersRepository.find(options);
  }

  async findOne(options?: FindOneOptions<User>): Promise<User | undefined> {
    return this.usersRepository.findOne(options);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.usersRepository.delete(id);
  }

  async findAndCount(
    options: FindManyOptions<User>,
  ): Promise<[User[], number]> {
    return this.usersRepository.findAndCount(options);
  }

  async edit(id: string, update: DeepPartial<User> | User): Promise<User> {
    await this.usersRepository.update(id, update);
    return this.findById(id);
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  async validatePassword(
    incomingPassword: string,
    databaseUserPassword: string,
  ): Promise<boolean> {
    return compare(incomingPassword, databaseUserPassword);
  }

  async findByIdWithPassword(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id, deletedAt: null } });
  }
} 