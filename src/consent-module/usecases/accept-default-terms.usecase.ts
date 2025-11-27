import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AgendaEventStatus } from '../../agenda/domain/enum/agendaEventStatus.enum';
import { ConsentType } from '../../agenda/domain/enum/consentType.enum';
import { SignedConsentEntity } from '../../agenda/infrastructure/entities/signedConsent.entity';
import { AgendaEventRepository } from '../../agenda/infrastructure/repositories/agendaEvent.repository';
import { AcceptDefaultTermsDto } from '../domain/dtos/accept-default-terms.dto';
import { SignedConsentRepository } from '../infrastructure/repositories/signed-consent.repository';

@Injectable()
export class AcceptDefaultTermsUseCase {
  constructor(
    private readonly signedConsentRepository: SignedConsentRepository,
    private readonly agendaEventRepository: AgendaEventRepository,
  ) {}

  async execute(
    dto: AcceptDefaultTermsDto,
    userId: string, // Extracted from auth context (e.g., JWT)
    ipAddress?: string, // Extracted from request
    userAgent?: string, // Extracted from request
  ): Promise<SignedConsentEntity> {
    // Validate event exists and is in appropriate status
    const event = await this.agendaEventRepository.findOne({
      where: { id: dto.eventId },
      relations: ['agenda'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${dto.eventId} not found.`);
    }

    // Validate event status: Consent can only be signed for suitable event statuses
    const allowedEventStatuses = [
      AgendaEventStatus.CREATED,
      AgendaEventStatus.PENDING_CONFIRMATION,
      AgendaEventStatus.CONFIRMED,
      AgendaEventStatus.RESCHEDULED,
    ];

    if (!allowedEventStatuses.includes(event.status)) {
      throw new BadRequestException(
        `Default terms cannot be accepted for an event with status '${event.status}'.`,
      );
    }

    // Check if user has already signed any consent for this event
    const existingConsent =
      await this.signedConsentRepository.findByEventAndUser(
        dto.eventId,
        userId,
      );
    if (existingConsent) {
      throw new ConflictException(
        'Terms and conditions have already been accepted for this event.',
      );
    }

    // For MVP: Create default signed data
    const defaultSignedData = {
      acceptGeneralTerms: true,
      acceptedAt: new Date().toISOString(),
      acceptanceMethod: 'MVP_DEFAULT_ENDPOINT',
      clientName: dto.digitalSignature, // Assuming digital signature is the name for now
    };

    // Create the signed consent (without formTemplateId for MVP - indicates default terms)
    const signedConsent = await this.signedConsentRepository.create({
      eventId: dto.eventId,
      formTemplateId: null, // null indicates default terms for MVP
      signedData: defaultSignedData,
      digitalSignature: dto.digitalSignature,
      userId,
      ipAddress,
      userAgent,
    });

    return signedConsent;
  }
}
