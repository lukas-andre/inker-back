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
import { CreateQuotationReqDto } from '../dtos/createQuotationReq.dto';
import { QuotationDto } from '../dtos/getQuotationRes.dto';
import { GetQuotationsQueryDto } from '../dtos/getQuotationsQuery.dto';
import {
  ArtistQuoteDto,
  CustomerQuotationActionDto,
  QuotationArtistRejectDto,
  QuotationCustomerAcceptDto,
  QuotationCustomerAppealDto,
  QuotationCustomerRejectDto,
  QuotationEarlyCancelDto,
} from '../dtos/quotations.dto';
import { ReplyQuotationReqDto } from '../dtos/replyQuotationReq.dto';

@ApiTags('quotations')
@Controller('quotations')
@UseGuards(AuthGuard)
export class QuotationController {
  constructor(private readonly quotationHandler: AgendaHandler) {}

  @ApiOperation({ summary: 'Reply to quotation' })
  @HttpCode(200)
  @ApiCreatedResponse({
    description: 'Quotation replied successfully.',
    type: DefaultResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Reply Quotation',
    type: ReplyQuotationReqDto,
  })
  @Put('reply')
  @UseInterceptors(FilesFastifyInterceptor('files[]', 10))
  async replyQuotation(
    @UploadedFiles() proposedImages: FileInterface[],
    @Body() dto: ReplyQuotationReqDto,
  ): Promise<any> {
    return this.quotationHandler.replyQuotation(dto, proposedImages);
  }

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
  async getQuotation(@Param('id') id: number): Promise<QuotationDto> {
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

  @Delete(':id/cancel-early')
  @ApiOperation({ summary: 'Cancel a quotation' })
  @ApiResponse({ status: 200, description: 'Quotation cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async cancelEarlyQuotation(
    @Param('id') id: number,
    @Body() dto: QuotationEarlyCancelDto,
  ) {
    await this.quotationHandler.handleEarlyQuotation(id, dto);
    return { message: 'Quotation cancelled successfully' };
  }

  @Put(':id/artist-quote')
  @ApiOperation({ summary: 'Artist sends a quotation' })
  @ApiResponse({
    status: 200,
    description: 'Quotation sent successfully',
    type: DefaultResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Artist Quote',
    type: ArtistQuoteDto,
  })
  @UseInterceptors(FilesFastifyInterceptor('proposedDesigns', 10))
  async artistSendQuotation(
    @Param('id') id: number,
    @Body() artistQuoteDto: ArtistQuoteDto,
    @UploadedFiles() proposedDesigns: FileInterface[],
  ): Promise<void> {
    await this.quotationHandler.artistSendQuotation(
      id,
      artistQuoteDto,
      proposedDesigns,
    );
  }

  @Put(':id/customer-action')
  @ApiOperation({
    summary: 'Customer action on a quotation (accept, reject, or appeal)',
  })
  @ApiResponse({
    status: 200,
    description: 'Quotation action processed successfully',
    type: DefaultResponseDto,
  })
  async customerQuotationAction(
    @Param('id') id: number,
    @Body() customerActionDto: CustomerQuotationActionDto,
  ): Promise<void> {
    await this.quotationHandler.customerQuotationAction(id, customerActionDto);
  }
}
