import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { SettingsHandler } from '../handlers/settings.handler';

export class UpdateSettingsDto {
  @ApiProperty({
    example: true,
    description: 'Enable/disable setting',
    required: true,
  })
  @IsBoolean()
  readonly enabled: boolean;
}
@ApiTags('settings')
@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsHandler: SettingsHandler,
    private readonly requestService: RequestContextService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  @ApiOkResponse({ description: 'Settings retrieved successfully' })
  async getSettings() {
    return this.settingsHandler.handleGetSettings(this.requestService.userId);
  }

  @Put('notifications')
  @ApiOperation({ summary: 'Update notifications settings' })
  async updateNotifications(@Body() { enabled }: UpdateSettingsDto) {
    return this.settingsHandler.handleUpdateNotifications(
      this.requestService.userId,
      enabled,
    );
  }

  @Put('location-services')
  @ApiOperation({ summary: 'Update location services settings' })
  async updateLocationServices(@Body() { enabled }: UpdateSettingsDto) {
    return this.settingsHandler.handleUpdateLocationServices(
      this.requestService.userId,
      enabled,
    );
  }
}
