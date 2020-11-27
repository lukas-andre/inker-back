import {
  Controller,
  HttpCode,
  Post,
  Body,
  Logger,
  Inject,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AUTH_HANDLER_DI_TOKEN, AuthHandler } from '../../use_cases/auth.handler';
import { LoginReqDto } from '../dtos/loginReq.dto';
import { LoginResDto } from '../dtos/loginRes.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly serviceName = AuthController.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(@Inject(AUTH_HANDLER_DI_TOKEN) private readonly authHandler: AuthHandler) {}

  @ApiOperation({ summary: 'Login User' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Login successful.', type: LoginResDto })
  @ApiConflictResponse({ description: 'Invalid credentials.' })
  @Post('login')
  async login(@Body() loginReqDto: LoginReqDto): Promise<LoginResDto> {
    return await this.authHandler.login(loginReqDto);
  }
}
