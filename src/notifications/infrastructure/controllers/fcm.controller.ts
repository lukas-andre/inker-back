import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { RegisterFcmTokenUseCase } from '../../usecases/registerFcmToken.usecase';
import { RemoveFcmTokenUseCase } from '../../usecases/removeFcmToken.usecase';
import { RegisterFcmTokenRequestDto } from '../dtos/registerFcmToken.dto';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';

@ApiTags('FCM')
@Controller('fcm')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FcmController {
  constructor(
    private readonly registerFcmTokenUseCase: RegisterFcmTokenUseCase,
    private readonly removeFcmTokenUseCase: RemoveFcmTokenUseCase,
    private readonly requestContext: RequestContextService
  ) { }

  @Post('token')
  @ApiOperation({ summary: 'Register FCM token for push notifications' })
  @ApiResponse({
    status: 201,
    description: 'Token registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async registerToken(
    @Body() dto: RegisterFcmTokenRequestDto,
  ) {
    const { id } = this.requestContext.getContext()
    return this.registerFcmTokenUseCase.execute({
      userId: id,
      token: dto.token,
      deviceType: dto.deviceType,
    });
  }

  @Delete('token/:token')
  @ApiOperation({ summary: 'Remove FCM token' })
  @ApiResponse({
    status: 200,
    description: 'Token removed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Token not found',
  })
  async removeToken(
    @Param('token') token: string,
  ) {
    const { id } = this.requestContext.getContext()
    return this.removeFcmTokenUseCase.execute({
      userId: id,
      token,
    });
  }
}