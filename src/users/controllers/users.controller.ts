import { Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { Body } from '@nestjs/common';
import { CreateUserDto } from '../dtos/createUser.dto';
import { UsersHandler } from '../handlers/users.handler';
import { User } from '../entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersHandler: UsersHandler) {}

  @ApiOperation({ summary: 'Create User' })
  @ApiCreatedResponse({ description: 'Users has been created', type: User })
  @ApiNotFoundResponse({ description: 'Rol does not exists' })
  @ApiConflictResponse({ description: 'Users already exists' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersHandler.handleCreate(createUserDto);
  }
}
