import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesFastifyInterceptor } from 'fastify-file-interceptor';

import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { AgendaHandler } from '../agenda.handler';
import { ArtistQuotationActionDto } from '../dtos/artistQuotationAction.dto';
import { CreateQuotationReqDto } from '../dtos/createQuotationReq.dto';
import { CustomerQuotationActionDto } from '../dtos/customerQuotationAction.dto';
import { QuotationDto } from '../dtos/getQuotationRes.dto';
import { GetQuotationsQueryDto } from '../dtos/getQuotationsQuery.dto';
import { TimeSlot } from '../../services/scheduling.service';

@ApiTags('quotations')
@Controller('quotations')
@UseGuards(AuthGuard)
export class QuotationController {
  constructor(private readonly quotationHandler: AgendaHandler) {}

  @ApiOperation({ summary: 'Create quotation' })
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'Quotation created successfully.',
    type: DefaultResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create Quotation',
    type: CreateQuotationReqDto,
  })
  @Post()
  @UseInterceptors(FilesFastifyInterceptor('files[]', 10))
  async createQuotation(
    @UploadedFiles() referenceImages: FileInterface[],
    @Body() dto: CreateQuotationReqDto,
  ): Promise<any> {
    return this.quotationHandler.createQuotation(dto, referenceImages);
  }

  @ApiOperation({ summary: 'Get quotation' })
  @ApiResponse({
    status: 200,
    description: 'Quotation retrieved successfully.',
    type: QuotationDto,
  })
  @Get(':id')
  async getQuotation(@Param('id') id: string): Promise<Partial<QuotationDto>> {
    return this.quotationHandler.getQuotation(id);
  }

  @ApiOperation({ summary: 'Get quotations' })
  @ApiResponse({
    status: 200,
    description: 'Quotations retrieved successfully.',
    type: QuotationDto,
    isArray: true,
  })
  @Get()
  async getQuotations(
    @Query() query: GetQuotationsQueryDto,
  ): Promise<{ items: QuotationDto[]; total: number }> {
    return this.quotationHandler.getQuotations(query);
  }

  @Post(':id/artist-actions')
  @HttpCode(204)
  @ApiOperation({ summary: 'Artist performs an action on a quotation' })
  @ApiResponse({
    status: 204,
    description: 'Artist action processed successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Artist Action', type: ArtistQuotationActionDto })
  @UseInterceptors(FilesFastifyInterceptor('proposedDesigns[]', 10))
  async processArtistAction(
    @Param('id') id: string,
    @Body() dto: ArtistQuotationActionDto,
    @UploadedFiles() proposedDesigns: FileInterface[],
  ): Promise<void> {
    await this.quotationHandler.processArtistAction(id, dto, proposedDesigns);
  }

  @Post(':id/customer-actions')
  @HttpCode(204)
  @ApiOperation({ summary: 'Customer performs an action on a quotation' })
  @ApiResponse({
    status: 204,
    description: 'Customer action processed successfully',
  })
  async processCustomerAction(
    @Param('id') id: string,
    @Body() dto: CustomerQuotationActionDto,
  ): Promise<void> {
    await this.quotationHandler.processCustomerAction(id, dto);
  }

  @Post(':id/mark-as-read')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark quotation as read' })
  @ApiResponse({
    status: 204,
    description: 'Quotation marked as read successfully',
  })
  async markAsRead(@Param('id') id: string): Promise<void> {
    await this.quotationHandler.markQuotationAsRead(id);
  }

  // New endpoint for Automated Scheduling
  @ApiOperation({ summary: 'Get suggested appointment slots for a quotation' })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Suggested time slots retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @Get(':id/available-slots')
  async getSuggestedTimeSlots(@Param('id') id: string): Promise<TimeSlot[]> {
    return this.quotationHandler.handleGetSuggestedTimeSlots(id);
  }
}
