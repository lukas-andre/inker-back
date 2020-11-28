import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Permission } from '../entities/permission.entity';
import { PermissionsHandler } from '../handlers/permissions.handler';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsHandler: PermissionsHandler) {}

  @ApiOperation({ summary: 'Find Permissions' })
  @ApiOkResponse({
    description: 'The permissions exists.',
    isArray: true,
    type: Permission,
  })
  @Get()
  async findAll(@Query() query: any): Promise<Permission[]> {
    return await this.permissionsHandler.findAll(query);
  }

  @Get('/initial')
  async initial(): Promise<Permission[]> {
    return await this.permissionsHandler.handleInitial();
  }

  @Get('/routes')
  async findRoutes(): Promise<any> {
    return await this.permissionsHandler.findRoutes();
  }

  @ApiOperation({ summary: 'Get Permissions By Id' })
  @ApiParam({ name: 'id', required: true, type: String})
  @ApiOkResponse({
    description: 'The permissions exists.',
    isArray: true,
    type: Permission,
  })
  @ApiResponse({ status: 404, description: 'Permission does not exist.' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<Permission> {
    const role = await this.permissionsHandler.findOne(id);
    if (!role) {
      throw new NotFoundException();
    }

    return role;
  }
}
