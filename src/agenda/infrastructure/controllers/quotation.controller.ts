import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFastifyInterceptor } from 'fastify-file-interceptor';
import { DefaultResponseDto, DefaultResponseStatus } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { AgendaHandler } from '../agenda.handler';
import { ArtistQuotationActionDto } from '../dtos/artistQuotationAction.dto';
import { CreateQuotationReqDto } from '../dtos/createQuotationReq.dto';
import { CustomerQuotationActionDto } from '../dtos/customerQuotationAction.dto';
import { GetQuotationResDto } from '../dtos/getQuotationRes.dto';
import { GetQuotationsQueryDto } from '../dtos/getQuotationsQuery.dto';
import { TimeSlot } from '../../services/scheduling.service';
import { ListOpenQuotationsQueryDto, GetOpenQuotationsResDto } from '../dtos/listOpenQuotationsQuery.dto';
import { CreateQuotationOfferReqDto } from '../dtos/createQuotationOfferReq.dto';
import { ListQuotationOffersResDto } from '../dtos/listQuotationOffersRes.dto';
import { SendOfferMessageReqDto } from '../dtos/sendOfferMessageReq.dto';
import { OfferMessageDto } from '../../domain/dtos/offerMessage.dto';
import { ListParticipatingQuotationsResDto } from '../../domain/dtos/participatingQuotationOffer.dto';
import { ParticipatingQuotationOfferDto } from '../../domain/dtos/participatingQuotationOffer.dto';
import { UpdateQuotationOfferReqDto } from '../dtos/updateQuotationOfferReq.dto';
import { UpdateOpenQuotationReqDto } from '../dtos/updateOpenQuotationReq.dto';

@ApiTags('quotations')
@Controller('quotations')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class QuotationController {
  constructor(private readonly quotationHandler: AgendaHandler) { }

  @ApiOperation({ summary: 'Create a direct or open quotation' })
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'Quotation created successfully.',
    type: DefaultResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateQuotationReqDto })
  @Post()
  @UseInterceptors(FileFastifyInterceptor('files[]', 10))
  async createQuotation(
    @UploadedFile() referenceImages: FileInterface[],
    @Body() dto: CreateQuotationReqDto,
  ): Promise<any> {
    return this.quotationHandler.createQuotation(dto, referenceImages);
  }

  @ApiOperation({ summary: 'Get a specific quotation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Quotation retrieved successfully.',
    type: GetQuotationResDto,
  })
  @Get(':id')
  async getQuotation(@Param('id') id: string): Promise<GetQuotationResDto> {
    return this.quotationHandler.getQuotation(id);
  }

  @ApiOperation({ summary: 'List quotations (filtered, for customer or artist)' })
  @ApiResponse({
    status: 200,
    description: 'Quotations retrieved successfully.',
    type: GetQuotationResDto,
    isArray: true,
  })
  @Get()
  async getQuotations(
    @Query() query: GetQuotationsQueryDto,
  ): Promise<{ items: GetQuotationResDto[]; total: number }> {
    return this.quotationHandler.getQuotations(query);
  }

  @ApiOperation({ summary: '[Artist] List quotations the artist is participating in (has offered on)' })
  @ApiOkResponse({
    description: 'Participating quotation offers retrieved successfully.',
    type: ListParticipatingQuotationsResDto,
  })
  @Get('/participating')
  async listParticipatingQuotations(
  ): Promise<ListParticipatingQuotationsResDto> {
    return this.quotationHandler.listParticipatingQuotations();
  }

  @ApiOperation({ summary: '[Artist] List available open quotations' })
  @ApiOkResponse({
    description: 'Open quotations retrieved successfully. Each quotation includes a list of offers received so far.',
    type: GetOpenQuotationsResDto,
  })
  @Get('/open')
  async listOpenQuotations(
    @Query() query: ListOpenQuotationsQueryDto,
  ): Promise<GetOpenQuotationsResDto> {
    return this.quotationHandler.listOpenQuotations(query);
  }

  @ApiOperation({ summary: '[Artist] Submit an offer for an open quotation' })
  @ApiCreatedResponse({ description: 'Offer submitted successfully.', type: DefaultResponseDto })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiBody({ type: CreateQuotationOfferReqDto })
  @Post(':id/offers')
  @UseInterceptors(FileFastifyInterceptor('files[]', 10))
  async submitOffer(
    @Param('id') quotationId: string,
    @Body() dto: CreateQuotationOfferReqDto,
    @UploadedFile() files: FileInterface[],
  ): Promise<DefaultResponseDto> {
    const result = await this.quotationHandler.submitOffer(quotationId, dto);
    return { status: DefaultResponseStatus.CREATED, data: `Offer ${result.id} submitted.` };
  }

  @ApiOperation({ summary: '[Customer] List offers received for an open quotation' })
  @ApiOkResponse({ description: 'Offers retrieved successfully.', type: ListQuotationOffersResDto })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @Get(':id/offers')
  async listOffers(
    @Request() req,
    @Param('id') quotationId: string,
  ): Promise<ListQuotationOffersResDto> {
    return this.quotationHandler.listOffers(quotationId);
  }

  @ApiOperation({ summary: '[Customer] Accept a specific offer for an open quotation' })
  @ApiOkResponse({ description: 'Offer accepted successfully.', type: DefaultResponseDto })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiParam({ name: 'offerId', description: 'Offer ID to accept' })
  @Post(':id/offers/:offerId/accept')
  async acceptOffer(
    @Param('id') quotationId: string,
    @Param('offerId') offerId: string,
  ): Promise<DefaultResponseDto> {
    const result = await this.quotationHandler.acceptOffer(quotationId, offerId);
    return { status: DefaultResponseStatus.OK, data: result.message };
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
  @UseInterceptors(FileFastifyInterceptor('proposedDesigns[]', 10))
  async processArtistAction(
    @Param('id') id: string,
    @Body() dto: ArtistQuotationActionDto,
    @UploadedFile() proposedDesigns: FileInterface[],
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

  @ApiOperation({ summary: '[Customer/Artist] Send a message regarding a specific offer' })
  @ApiOkResponse({ description: 'Message sent successfully.', type: OfferMessageDto })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiParam({ name: 'offerId', description: 'Offer ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Message content and optional image file. Send image using a field named \'image\'.',
    type: SendOfferMessageReqDto,
  })
  @Post(':id/offers/:offerId/messages')
  @UseInterceptors(FileFastifyInterceptor('image'))
  async sendOfferMessage(
    @Param('id') quotationId: string,
    @Param('offerId') offerId: string,
    @Body() dto: SendOfferMessageReqDto,
    @UploadedFile() image?: FileInterface,
  ): Promise<OfferMessageDto> {
    const newMessage = await this.quotationHandler.sendOfferMessage(
      quotationId,
      offerId,
      dto,
      image,
    );
    return newMessage as OfferMessageDto;
  }

  @ApiOperation({ summary: 'Get a single quotation offer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Quotation offer retrieved successfully.',
    type: ParticipatingQuotationOfferDto,
  })
  @ApiResponse({ status: 404, description: 'Quotation offer not found.' })
  @Get('offers/:id')
  async getQuotationOffer(
    @Param('id') offerId: string,
  ): Promise<ParticipatingQuotationOfferDto> {
    return this.quotationHandler.getQuotationOffer(offerId);
  }

  @ApiOperation({ summary: '[Artist] Update quotation offer estimated cost and duration' })
  @ApiOkResponse({ description: 'Quotation offer updated successfully.', type: DefaultResponseDto })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiParam({ name: 'offerId', description: 'Offer ID to update' })
  @ApiBody({ type: UpdateQuotationOfferReqDto })
  @Patch(':id/offers/:offerId')
  async updateQuotationOffer(
    @Param('id') quotationId: string,
    @Param('offerId') offerId: string,
    @Body() dto: UpdateQuotationOfferReqDto,
  ): Promise<DefaultResponseDto> {
    await this.quotationHandler.updateQuotationOffer(quotationId, offerId, dto);
    return { status: DefaultResponseStatus.OK, data: 'Quotation offer updated successfully.' };
  }

  @ApiOperation({ summary: '[Customer] Actualizar cotización abierta (presupuesto, descripción, imagen generada)' })
  @ApiOkResponse({ description: 'Cotización actualizada correctamente.', type: DefaultResponseDto })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiBody({ type: UpdateOpenQuotationReqDto })
  @Patch(':id')
  async updateOpenQuotation(
    @Param('id') quotationId: string,
    @Body() dto: UpdateOpenQuotationReqDto,
  ): Promise<DefaultResponseDto> {
    await this.quotationHandler.updateOpenQuotation(quotationId, dto);
    return { status: DefaultResponseStatus.OK, data: 'Cotización actualizada correctamente.' };
  }
}
