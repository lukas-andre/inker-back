import { Controller, HttpCode, Post, Body, Logger } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AgendaHandler } from './agenda.handler';

@ApiTags('agenda')
@Controller('agenda')
export class AgendaController {
  private readonly serviceName = AgendaController.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(private readonly authHandler: AgendaHandler) {}

//   @ApiOperation({ summary: 'Login User' })
//   @HttpCode(200)
//   @ApiOkResponse({ description: 'Login successful.', type: LoginResDto })
//   @ApiConflictResponse({ description: 'Invalid credentials.' })
//   @Post('login')
//   async login(@Body() loginReqDto: LoginReqDto): Promise<LoginResDto> {
//     return await this.authHandler.handleLogin(loginReqDto);
//   }
}
