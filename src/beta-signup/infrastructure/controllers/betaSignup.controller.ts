import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProcessBetaSignupUseCase } from '../../usecases/processBetaSignup.usecase';
import { BetaSignupRequestDto } from '../dtos/betaSignupRequest.dto';

@ApiTags('Beta Signup')
@Controller('beta-signup')
export class BetaSignupController {
  constructor(
    private readonly processBetaSignupUseCase: ProcessBetaSignupUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit beta signup request',
    description: 'Submits a beta signup request and sends notification email',
  })
  @ApiBody({ type: BetaSignupRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Beta signup request submitted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to process beta signup request',
  })
  async submitBetaSignup(
    @Body() dto: BetaSignupRequestDto,
  ): Promise<{ message: string }> {
    await this.processBetaSignupUseCase.processBetaSignup(dto);

    return {
      message: 'Beta signup request submitted successfully',
    };
  }
}