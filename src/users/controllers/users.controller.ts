import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body } from '@nestjs/common';
import { CreateUserDto } from '../dtos/createUser.dto';
import { UsersHandler } from '../handlers/users.handler';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersHandler: UsersHandler) {}

  @ApiOperation({ summary: 'Create User' })
  @ApiResponse({ status: 201, description: 'Users has been created' })
  @ApiResponse({ status: 400, description: 'Rolo does not exists' })
  @ApiResponse({ status: 409, description: 'Users already exists' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersHandler.handleCreate(createUserDto);
  }
}
