import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CreateCustomerDto } from '../dtos/createCustomer.dto';
import { CustomerHandler } from '../../use_cases/customers.handler';
import { User } from '../../../users/infrastructure/entities/user.entity';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customerHandler: CustomerHandler) {}

  @ApiOperation({ summary: 'Create Customer' })
  @ApiCreatedResponse({ description: 'Users has been created', type: User })
  @ApiNotFoundResponse({ description: 'Rolo does not exists' })
  @ApiConflictResponse({ description: 'Users already exists' })
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.customerHandler.handleCreate(createCustomerDto);
  }
}
