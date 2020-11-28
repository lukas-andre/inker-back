import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { CustomerHandler } from './customers.handler';
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
  @ApiNotFoundResponse({ description: 'Rolo does not exists' })
  @ApiConflictResponse({ description: 'Users already exists' })
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerReqDto) {
    return await this.customerHandler.handleCreate(createCustomerDto);
  }
}
