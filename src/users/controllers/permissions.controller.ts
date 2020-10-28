import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permission } from '../entities/permission.entity';
import { PermissionsHandler } from '../handlers/permissions.handler';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsHandler: PermissionsHandler) {}

  @ApiOperation({ summary: 'Find Permissions' })
  @ApiResponse({ status: 200 })
  @Get()
  async findAll(@Query() query: any): Promise<Permission[]> {
    return await this.permissionsHandler.findAll(query);
  }

  @Get('/initial')
  async initial(@Query() query: any): Promise<any> {
    return await this.permissionsHandler.handleInitial();
  }

  @Get('/routes')
  async findRoutes(@Query() query: any): Promise<any> {
    return await this.permissionsHandler.findRoutes();
  }

  @ApiOperation({ summary: 'Get Permissions By Id' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'The permissions exists.' })
  @ApiResponse({ status: 404, description: 'Permission does not exist.' })
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Permission> {
    const role = await this.permissionsHandler.findOne(id);
    if (!role) {
      throw new NotFoundException();
    }

    return role;
  }
}
