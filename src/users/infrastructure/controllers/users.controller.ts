import { Controller, Post, UseInterceptors } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { Body } from '@nestjs/common';
import { CreateUserReqDto } from '../dtos/createUserReq.dto';
import { UsersHandler } from '../handlers/users.handler';
import { CreateUserResDto } from '../dtos/createUserRes.dto';
import { LoggingInterceptor } from '../../../global/aspects/logging.interceptor';

@ApiTags('users')
@Controller('users')
@UseInterceptors(LoggingInterceptor)
export class UsersController {
  constructor(private readonly usersHandler: UsersHandler) {}

  @ApiOperation({ summary: 'Create User' })
  @ApiCreatedResponse({
    description: 'Users has been created',
    type: CreateUserResDto,
  })
  @ApiNotFoundResponse({ description: 'Rol does not exists' })
  @ApiConflictResponse({ description: 'Users already exists' })
  @Post()
  async create(@Body() createUserDto: CreateUserReqDto) {
    return this.usersHandler.handleCreate(createUserDto);
  }
}
