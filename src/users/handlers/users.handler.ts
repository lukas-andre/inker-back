import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/createUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../services/users.service';

@Injectable()
export class UsersHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async handleCreate(createUserDto: CreateUserDto) {
    const created = await this.usersService.create(createUserDto);
    if (!created) {
      throw new ConflictException('User already exists');
    }

    return created;
  }
}
