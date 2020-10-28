import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '../entities/role.entity';
import { RolesHandler } from '../handlers/roles.handler';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesHandler: RolesHandler) {}

  @ApiOperation({ summary: 'Init Roles (Init Permissions first)' })
  @ApiResponse({ status: 200 })
  @Get('init-roles')
  async initRoles(@Query() query: any): Promise<Role[]> {
    return await this.rolesHandler.initRoles();
  }

  @ApiOperation({ summary: 'Find Roles' })
  @ApiResponse({ status: 200 })
  @Get()
  async findAll(@Query() query: any): Promise<Role[]> {
    return await this.rolesHandler.findAll(query);
  }

  @ApiOperation({ summary: 'Get Role By Id' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'The role exists.' })
  @ApiResponse({ status: 404, description: 'Role does not exist.' })
  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number): Promise<Role> {
    const role = await this.rolesHandler.findOne(id);
    if (!role) {
      throw new NotFoundException();
    }

    return role;
  }
}
