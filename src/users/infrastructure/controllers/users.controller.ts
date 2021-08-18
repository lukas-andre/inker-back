import {
  Body,
  Controller,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LoggingInterceptor } from '../../../global/aspects/logging.interceptor';
import { CreateUserReqDto } from '../dtos/createUserReq.dto';
import { CreateUserResDto } from '../dtos/createUserRes.dto';
import { SendVerificationCodeQueryDto } from '../dtos/sendVerificationCodeQuery.dto';
import { VerificationType } from '../entities/verificationHash.entity';
import { UsersHandler } from '../handlers/users.handler';

@ApiTags('users')
@Controller('users')
@UseInterceptors(LoggingInterceptor)
export class UsersController {
  private logger = new Logger(UsersController.name);

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

  @ApiOperation({ summary: 'Send SMS Validation Code' })
  @ApiParam({
    name: 'userId',
    description: 'User id',
    required: true,
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'phoneNumber',
    description: 'Phone number intl',
    example: '+56964484712',
    required: true,
  })
  @ApiQuery({
    name: 'type',
    description: 'Sending type event',
    enum: VerificationType,
    example: VerificationType.SMS,
    required: true,
  })
  @ApiCreatedResponse({
    description: 'SMS has been sended',
    type: Boolean,
  })
  @ApiNotFoundResponse({ description: 'User does not exists' })
  @ApiConflictResponse({ description: 'SMS already sended' })
  @Post(':userId/send-verification-code')
  async sendValidationCode(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() sendVerificationCodeQueryDto: SendVerificationCodeQueryDto,
  ) {
    this.logger.log({ sendVerificationCodeQueryDto });
    return this.usersHandler.handleSendValidationCode(
      userId,
      sendVerificationCodeQueryDto,
    );
  }
}
