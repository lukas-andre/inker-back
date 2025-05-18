import { Controller, Post, Body, Param, Get, UseGuards, Req, Ip, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateFormTemplateDto } from '../../domain/dtos/create-form-template.dto';
import { SignConsentDto } from '../../domain/dtos/sign-consent.dto';
import { FormTemplateDto } from '../../domain/dtos/form-template.dto';
import { SignedConsentDto } from '../../domain/dtos/signed-consent.dto';
import { CreateTemplateUseCase } from '../../usecases/create-template.usecase';
import { GetTemplateUseCase } from '../../usecases/get-template.usecase';
import { SignConsentUseCase } from '../../usecases/sign-consent.usecase';
import { UserType } from '../../../users/domain/enums/userType.enum'; // Corrected path
import { Request } from 'express';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { RolesGuard } from '../../../global/infrastructure/guards/roles.guard';
import { Roles } from '../../../global/infrastructure/decorators/roles.decorator';

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
    private readonly getTemplateUseCase: GetTemplateUseCase,
    private readonly signConsentUseCase: SignConsentUseCase,
  ) {}

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
    const callingArtistId = req.user.artistId; 
    if (!callingArtistId) {
      throw new HttpException('Artist ID not found in token for an artist user.', HttpStatus.FORBIDDEN);
    }
    return this.createTemplateUseCase.execute(createFormTemplateDto, callingArtistId);
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
    const callingArtistId = req.user.artistId;
    if (callingArtistId !== targetArtistId) {
      throw new HttpException('Artists can only access their own templates via this endpoint.', HttpStatus.FORBIDDEN);
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

  // TODO: Endpoint to get signed consents (e.g., for an event, for a user)
  // @Get('signed/event/:eventId')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserType.ARTIST) // Artists can see consents for their events
  // ... getSignedConsentsForEvent(@Param('eventId') eventId: string) { ... }
} 