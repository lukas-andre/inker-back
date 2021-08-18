import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerHandler } from './customers.handler';
import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { CreateCustomerResDto } from './dtos/createCustomerRes.dto';

@ApiTags('customers')
@Controller('customers')
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
}
