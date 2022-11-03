import { Controller, Get, HttpCode, Logger, Request } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CustomerFeedHandler } from './customerFeed.handler';

@ApiTags('customer-feed')
@Controller('customer-feed')
export class CustomerFeedController {
  private readonly serviceName = CustomerFeedController.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(private readonly customerFeedHandler: CustomerFeedHandler) {}

  @ApiOperation({ summary: 'Get Customer Feed' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Get feed successful.', type: undefined })
  @ApiConflictResponse({ description: 'Problems getting feed.' })
  @Get()
  async getCustomerFeedByUserId(@Request() request: unknown): Promise<any> {
    return this.customerFeedHandler.handleGetCustomerFeed(request);
  }
}
