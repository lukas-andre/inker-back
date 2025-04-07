import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import {
  ARTIST_REJECT_REASONS,
  CUSTOMER_CANCEL_REASONS,
  CUSTOMER_REJECT_REASONS,
  SYSTEM_CANCEL_REASONS,
} from '../entities/quotation.entity';

@ApiTags('quotation-reasons')
@Controller('quotation-reasons')
@UseGuards(AuthGuard)
export class QuotationReasonsController {
  @Get('cancellation')
  @ApiOperation({ summary: 'Get all cancellation reasons' })
  @ApiResponse({ status: 200, description: 'Returns all cancellation reasons' })
  getCancellationReasons() {
    return {
      customerReasons: CUSTOMER_CANCEL_REASONS,
      systemReasons: SYSTEM_CANCEL_REASONS,
    };
  }

  @Get('rejection')
  @ApiOperation({ summary: 'Get all rejection reasons' })
  @ApiResponse({ status: 200, description: 'Returns all rejection reasons' })
  getRejectionReasons() {
    return {
      customerReasons: CUSTOMER_REJECT_REASONS,
      artistReasons: ARTIST_REJECT_REASONS,
    };
  }
}
