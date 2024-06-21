import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../../global/infrastructure/guards/auth.guard';

import { CustomerHandler } from './customers.handler';
import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { CreateCustomerResDto } from './dtos/createCustomerRes.dto';
import { Customer } from './entities/customer.entity';

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
}
