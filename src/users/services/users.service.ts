import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/createUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'user-db')
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const exists: number = await this.usersRepository.count({
      username: createUserDto.username,
      email: createUserDto.email,
    });

    if (exists) {
      return false;
    }

    const newUser = Object.assign(new User(), {
      ...createUserDto,
      password: await this.hashPasword(createUserDto.password),
    });

    const { password, ...result } = await this.usersRepository.save(newUser);
    return result;
  }

  async hashPasword(password: string): Promise<string> {
    return await hash(password, this.configService.get('auth.saltLength'));
  }
}
