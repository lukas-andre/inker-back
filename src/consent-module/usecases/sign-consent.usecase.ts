import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { ISignedConsentData } from '../domain/interfaces/signed-consent-repository.interface';
import { SignConsentDto } from '../domain/dtos/sign-consent.dto';
import { SignedConsentEntity } from '../../agenda/infrastructure/entities/signedConsent.entity';
import { AgendaEventRepository } from '../../agenda/infrastructure/repositories/agendaEvent.repository';
import { AgendaEvent } from '../../agenda/infrastructure/entities/agendaEvent.entity';
import { SignedConsentRepository } from '../infrastructure/repositories/signed-consent.repository';
import { FormTemplateRepository } from '../infrastructure/repositories/form-template.repository';
import { AgendaEventStatus } from '../../agenda/domain/enum/agendaEventStatus.enum'; // Added for status check
// import { PdfGenerationService } from '../services/pdf-generation.service'; // If triggering PDF generation
// import { Queue } from 'bull'; // If adding to Bull queue
// import { CONSENT_PDF_QUEUE } from '../constants'; // If using Bull constants

@Injectable()
export class SignConsentUseCase {
    constructor(
        private readonly signedConsentRepository: SignedConsentRepository,
        private readonly formTemplateRepository: FormTemplateRepository,
        private readonly agendaEventRepository: AgendaEventRepository, // Injecting concrete repository
        // @Inject(PdfGenerationService) // Optional: For direct PDF generation or queuing
        // private readonly pdfGenerationService: PdfGenerationService,
        // @InjectQueue(CONSENT_PDF_QUEUE) private readonly consentPdfQueue: Queue, // Optional: For Bull queue
    ) { }

    async execute(
        dto: SignConsentDto,
        userId: string, // Extracted from auth context (e.g., JWT)
        ipAddress?: string, // Extracted from request
        userAgent?: string, // Extracted from request
    ): Promise<SignedConsentEntity> {
        const event: AgendaEvent | null = await this.agendaEventRepository.findOne({ where: { id: dto.eventId }, relations: ['agenda'] });
        if (!event) {
            throw new NotFoundException(`Event with ID ${dto.eventId} not found.`);
        }

        // Validate event status: Consent can only be signed for suitable event statuses
        const allowedEventStatuses = [
            AgendaEventStatus.CONFIRMED,
            AgendaEventStatus.RESCHEDULED,
            AgendaEventStatus.IN_PROGRESS,
            // Add other statuses if applicable e.g., AgendaEventStatus.WAITING_FOR_CUSTOMER
        ];
        if (!allowedEventStatuses.includes(event.status)) {
            throw new BadRequestException(`Consent cannot be signed for an event with status '${event.status}'.`);
        }

        // Check if this user has already signed this specific consent for this event
        const existingConsent = await this.signedConsentRepository.findByEventUserAndTemplate(dto.eventId, userId, dto.formTemplateId);
        if (existingConsent) {
            throw new ConflictException('Consent already signed for this event' + (dto.formTemplateId ? ' and template.' : '.'));
        }

        // Validate formTemplateId if provided
        if (dto.formTemplateId) {
            const formTemplate = await this.formTemplateRepository.findById(dto.formTemplateId);
            if (!formTemplate) {
                throw new NotFoundException(`Form template with ID ${dto.formTemplateId} not found.`);
            }
            if (!formTemplate.isActive) {
                throw new BadRequestException(`Form template with ID ${dto.formTemplateId} is not active.`);
            }
            // Check if template artist matches event artist
            if (!event.agenda || !event.agenda.artistId) {
                // This case should ideally not happen if event data is consistent
                throw new BadRequestException('Event is not properly associated with an artist.');
            }
            if (formTemplate.artistId !== event.agenda.artistId) { 
              throw new ForbiddenException('Form template does not belong to the event artist.');
            }
        }

        const consentData: ISignedConsentData = {
            ...dto,
            userId,
            ipAddress,
            userAgent,
        };

        const signedConsent = await this.signedConsentRepository.create(consentData);

        // After successful signing, you might want to trigger other processes:
        // 1. Generate a PDF of the signed consent and store it (e.g., S3)
        // await this.pdfGenerationService.generateAndUpload(signedConsent);
        // OR: Add to a queue for background processing
        // await this.consentPdfQueue.add('generate-pdf', { consentId: signedConsent.id });

        // 2. Notify relevant parties (e.g., artist, user)

        return signedConsent;
    }
} 