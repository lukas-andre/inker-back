import { Controller, HttpCode, Post, Body, Logger } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginReqDto } from './dtos/loginReq.dto';
import { LoginResDto } from './dtos/loginRes.dto';
import { AuthHandler } from './auth.handler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly serviceName = AuthController.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(private readonly authHandler: AuthHandler) {}

  @ApiOperation({ summary: 'Login User' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Login successful.', type: LoginResDto })
  @ApiConflictResponse({ description: 'Invalid credentials.' })
  @Post('login')
  async login(@Body() loginReqDto: LoginReqDto): Promise<LoginResDto> {
    return this.authHandler.handleLogin(loginReqDto);
  }
}
