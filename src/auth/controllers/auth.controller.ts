import {
  Controller,
  HttpCode,
  Post,
  Body,
  Logger,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponseDto } from '../dtos/loginResponse.dto';
import { AuthHandler } from '../handlers/auth.handler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly serviceName = AuthController.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(private readonly authHandler: AuthHandler) {}

  @ApiOperation({ summary: 'Login User' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Login successful.', type: LoginResponseDto })
  @ApiConflictResponse({ description: 'Invalid credentials.' })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authHandler.login(loginDto);
  }
}
