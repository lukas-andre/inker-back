import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../../global/infrastructure/guards/auth.guard';

import { CustomerHandler } from './customers.handler';
import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { CreateCustomerResDto } from './dtos/createCustomerRes.dto';
import { Customer } from './entities/customer.entity';
import { UpdateCustomerDto } from './dtos/updateCustomerReq.dto';

@ApiTags('customers')
@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(private readonly customerHandler: CustomerHandler) {}

  @ApiOperation({ summary: 'Create Customer' })
  @ApiCreatedResponse({
    description: 'Users has been created',
    type: CreateCustomerResDto,
  })
  @ApiNotFoundResponse({ description: 'Rol does not exists' })
  @ApiConflictResponse({ description: 'Users already exists' })
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerReqDto) {
    return this.customerHandler.handleCreate(createCustomerDto);
  }

  @ApiOperation({ summary: 'Find all customers' })
  @Get('search')
  async search(@Query('term') term: string): Promise<Customer[]> {
    return this.customerHandler.handleSearchByTerm(term);
  }

  @ApiOperation({ summary: 'Update Customer Basic Info by Id' })
  @ApiOkResponse({
    description: 'Customer updated successfully',
    type: Customer,
  })
  @ApiParam({ name: 'id', required: true, type: Number })
  @Put(':id')
  @UsePipes(new ValidationPipe({ forbidUnknownValues: false }))
  async updateCustomerBasicInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCustomerDto,
  ) {
    return this.customerHandler.handleUpdateCustomerBasicInfo(id, body);
  }

  @ApiOperation({ summary: 'Update Current Customer Basic Info' })
  @ApiOkResponse({
    description: 'Customer updated successfully',
    type: Customer,
  })
  @Put('/me')
  @UsePipes(new ValidationPipe({ forbidUnknownValues: false }))
  async updateMe(@Body() body: UpdateCustomerDto) {
    return this.customerHandler.handleUpdateMe(body);
  }

  @ApiOperation({ summary: 'Find my profile' })
  @ApiOkResponse({
    description: 'Customer found successfully',
    type: Customer,
  })
  @Get('me')
  async me() {
    return this.customerHandler.handleFindMe();
  }
}
