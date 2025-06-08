import { Controller, Post, Body, Param, Get, UseGuards, Req, Ip, HttpException, HttpStatus, Put, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateFormTemplateDto } from '../../domain/dtos/create-form-template.dto';
import { UpdateFormTemplateDto } from '../../domain/dtos/update-form-template.dto';
import { UpdateTemplateStatusDto } from '../../domain/dtos/update-template-status.dto';
import { SignConsentDto } from '../../domain/dtos/sign-consent.dto';
import { AcceptDefaultTermsDto } from '../../domain/dtos/accept-default-terms.dto';
import { CheckConsentStatusDto } from '../../domain/dtos/check-consent-status.dto';
import { FormTemplateDto } from '../../domain/dtos/form-template.dto';
import { SignedConsentDto } from '../../domain/dtos/signed-consent.dto';
import { CreateTemplateUseCase } from '../../usecases/create-template.usecase';
import { UpdateTemplateUseCase } from '../../usecases/update-template.usecase';
import { DeleteTemplateUseCase } from '../../usecases/delete-template.usecase';
import { UpdateTemplateStatusUseCase } from '../../usecases/update-template-status.usecase';
import { GetTemplateUseCase } from '../../usecases/get-template.usecase';
import { SignConsentUseCase } from '../../usecases/sign-consent.usecase';
import { AcceptDefaultTermsUseCase } from '../../usecases/accept-default-terms.usecase';
import { CheckConsentStatusUseCase } from '../../usecases/check-consent-status.usecase';
import { UserType } from '../../../users/domain/enums/userType.enum'; // Corrected path
import { Request } from 'express';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { RolesGuard } from '../../../global/infrastructure/guards/roles.guard';
import { Roles } from '../../../global/infrastructure/decorators/roles.decorator';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    artistId?: string;
    userType: UserType;
  };
}

@ApiTags('Consent Module')
@Controller('consents')
export class ConsentController {
  constructor(
    private readonly createTemplateUseCase: CreateTemplateUseCase,
    private readonly updateTemplateUseCase: UpdateTemplateUseCase,
    private readonly deleteTemplateUseCase: DeleteTemplateUseCase,
    private readonly updateTemplateStatusUseCase: UpdateTemplateStatusUseCase,
    private readonly getTemplateUseCase: GetTemplateUseCase,
    private readonly signConsentUseCase: SignConsentUseCase,
    private readonly acceptDefaultTermsUseCase: AcceptDefaultTermsUseCase,
    private readonly checkConsentStatusUseCase: CheckConsentStatusUseCase,
    private readonly contextService: RequestContextService,
  ) { }

  @Post('templates')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserType.ARTIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new consent form template by an artist' })
  @ApiResponse({ status: 201, description: 'Template created successfully', type: FormTemplateDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not have required role or artist ID mismatch' })
  async createTemplate(
    @Body() createFormTemplateDto: CreateFormTemplateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormTemplateDto> {
    const { userTypeId, userType } = this.contextService.getContext();
    if (!userTypeId) {
      throw new HttpException('Artist ID not found in token for an artist user.', HttpStatus.FORBIDDEN);
    }

    if (userType !== UserType.ARTIST) {
      throw new HttpException('User does not have required role to create a template.', HttpStatus.FORBIDDEN);
    }

    return this.createTemplateUseCase.execute(createFormTemplateDto, userTypeId);
  }

  @Get('templates/:templateId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific consent form template by ID' })
  @ApiParam({ name: 'templateId', type: 'string', description: 'UUID of the form template' })
  @ApiResponse({ status: 200, description: 'Template details', type: FormTemplateDto })
  @ApiResponse({ status: 404, description: 'Template not found or not accessible' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTemplate(
    @Param('templateId') templateId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormTemplateDto> {
    const artistAccessingId = req.user.userType === UserType.ARTIST ? req.user.artistId : undefined;
    return this.getTemplateUseCase.execute(templateId, artistAccessingId);
  }

  @Get('templates/artist/:artistId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserType.ARTIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all active consent form templates for a specific artist (callable by the artist themselves)" })
  @ApiParam({ name: 'artistId', type: 'string', description: 'UUID of the artist' })
  @ApiResponse({ status: 200, description: 'List of templates', type: [FormTemplateDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an artist or not accessing their own templates' })
  async getArtistTemplates(
    @Param('artistId') targetArtistId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormTemplateDto[]> {
    const { userTypeId, userType } = this.contextService.getContext();
    if (!userTypeId) {
      throw new HttpException('Artist ID not found in token for an artist user.', HttpStatus.FORBIDDEN);
    }

    if (userType !== UserType.ARTIST) {
      throw new HttpException('User does not have required role to access templates.', HttpStatus.FORBIDDEN);
    }

    return this.getTemplateUseCase.executeForArtist(targetArtistId);
  }

  @Post('sign')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign a consent form' })
  @ApiResponse({ status: 201, description: 'Consent signed successfully', type: SignedConsentDto })
  @ApiResponse({ status: 400, description: 'Invalid input or consent conditions not met' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event or Template not found' })
  async signConsent(
    @Body() signConsentDto: SignConsentDto,
    @Req() req: AuthenticatedRequest,
    @Ip() ipAddress: string,
  ): Promise<SignedConsentDto> {
    const userId = req.user.id;
    const userAgent = req.headers['user-agent'];
    return this.signConsentUseCase.execute(signConsentDto, userId, ipAddress, userAgent);
  }

  @Put('templates/:templateId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserType.ARTIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a consent form template' })
  @ApiParam({ name: 'templateId', type: 'string', description: 'UUID of the form template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully', type: FormTemplateDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not have required role or is not the template owner' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body() updateFormTemplateDto: UpdateFormTemplateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormTemplateDto> {
    const { userTypeId, userType } = this.contextService.getContext();
    if (!userTypeId) {
      throw new HttpException('Artist ID not found in token for an artist user.', HttpStatus.FORBIDDEN);
    }

    if (userType !== UserType.ARTIST) {
      throw new HttpException('User does not have required role to update a template.', HttpStatus.FORBIDDEN);
    }

    return this.updateTemplateUseCase.execute(templateId, updateFormTemplateDto, userTypeId);
  }

  @Delete('templates/:templateId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserType.ARTIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a consent form template' })
  @ApiParam({ name: 'templateId', type: 'string', description: 'UUID of the form template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete template that has been used in signed consents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not have required role or is not the template owner' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteTemplate(
    @Param('templateId') templateId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const { userTypeId, userType } = this.contextService.getContext();
    if (!userTypeId) {
      throw new HttpException('Artist ID not found in token for an artist user.', HttpStatus.FORBIDDEN);
    }

    if (userType !== UserType.ARTIST) {
      throw new HttpException('User does not have required role to delete a template.', HttpStatus.FORBIDDEN);
    }

    return this.deleteTemplateUseCase.execute(templateId, userTypeId);
  }

  @Patch('templates/:templateId/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserType.ARTIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a consent form template status (activate/deactivate)' })
  @ApiParam({ name: 'templateId', type: 'string', description: 'UUID of the form template' })
  @ApiResponse({ status: 200, description: 'Template status updated successfully', type: FormTemplateDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not have required role or is not the template owner' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateTemplateStatus(
    @Param('templateId') templateId: string,
    @Body() updateTemplateStatusDto: UpdateTemplateStatusDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormTemplateDto> {
    const { userTypeId, userType } = this.contextService.getContext();
    if (!userTypeId) {
      throw new HttpException('Artist ID not found in token for an artist user.', HttpStatus.FORBIDDEN);
    }

    if (userType !== UserType.ARTIST) {
      throw new HttpException('User does not have required role to update template status.', HttpStatus.FORBIDDEN);
    }

    return this.updateTemplateStatusUseCase.execute(templateId, updateTemplateStatusDto.isActive, userTypeId);
  }

  @Post('accept-default-terms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserType.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept default terms and conditions for an event (MVP endpoint)' })
  @ApiResponse({ status: 201, description: 'Default terms accepted successfully', type: SignedConsentDto })
  @ApiResponse({ status: 400, description: 'Invalid input or event status not suitable for acceptance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only customers can accept terms' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 409, description: 'Terms have already been accepted for this event' })
  async acceptDefaultTerms(
    @Body() acceptDefaultTermsDto: AcceptDefaultTermsDto,
    @Req() req: AuthenticatedRequest,
    @Ip() ipAddress: string,
  ): Promise<SignedConsentDto> {
    const { userTypeId, userType } = this.contextService.getContext();
    const userAgent = req.headers['user-agent'];
    if (!userTypeId) {
      throw new HttpException('User ID not found in token for an artist user.', HttpStatus.FORBIDDEN);
    }

    if (userType !== UserType.CUSTOMER) {
      throw new HttpException('User does not have required role to accept terms.', HttpStatus.FORBIDDEN);
    }
    return this.acceptDefaultTermsUseCase.execute(acceptDefaultTermsDto, userTypeId, ipAddress, userAgent);
  }

  @Get('check-consent-status/:eventId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if customer has signed consent for an event' })
  @ApiParam({ name: 'eventId', type: 'string', description: 'UUID of the event' })
  @ApiResponse({ status: 200, description: 'Consent status information', type: CheckConsentStatusDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async checkConsentStatus(
    @Param('eventId') eventId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<CheckConsentStatusDto> {
    const { userType, userTypeId } = this.contextService.getContext();
    if (!userTypeId) {
      throw new HttpException('User ID not found in token for an artist user.', HttpStatus.FORBIDDEN);
    }

    if (userType !== UserType.CUSTOMER) {
      throw new HttpException('User does not have required role to check consent status.', HttpStatus.FORBIDDEN);
    }
    return this.checkConsentStatusUseCase.execute(eventId, userTypeId);
  }

  // TODO: Endpoint to get signed consents (e.g., for an event, for a user)
  // @Get('signed/event/:eventId')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserType.ARTIST) // Artists can see consents for their events
  // ... getSignedConsentsForEvent(@Param('eventId') eventId: string) { ... }
} 