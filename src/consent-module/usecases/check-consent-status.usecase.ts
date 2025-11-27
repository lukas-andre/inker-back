import { Injectable, NotFoundException } from '@nestjs/common';

import { AgendaEventRepository } from '../../agenda/infrastructure/repositories/agendaEvent.repository';
import { CheckConsentStatusDto } from '../domain/dtos/check-consent-status.dto';
import { FormTemplateRepository } from '../infrastructure/repositories/form-template.repository';
import { SignedConsentRepository } from '../infrastructure/repositories/signed-consent.repository';

@Injectable()
export class CheckConsentStatusUseCase {
  constructor(
    private readonly signedConsentRepository: SignedConsentRepository,
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly formTemplateRepository: FormTemplateRepository,
  ) {}

  async execute(
    eventId: string,
    userId: string,
  ): Promise<CheckConsentStatusDto> {
    // Validate event exists
    const event = await this.agendaEventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found.`);
    }

    // Check if user has signed any consent for this event
    const signedConsent = await this.signedConsentRepository.findByEventAndUser(
      eventId,
      userId,
    );

    if (!signedConsent) {
      return {
        eventId,
        hasSigned: false,
      };
    }

    // Get template info if available
    let templateTitle: string | undefined;
    if (signedConsent.formTemplateId) {
      const template = await this.formTemplateRepository.findById(
        signedConsent.formTemplateId,
      );
      templateTitle = template?.title;
    } else {
      templateTitle = 'Términos y Condiciones por Defecto';
    }

    return {
      eventId,
      hasSigned: true,
      signedAt: signedConsent.signedAt.toString(),
      templateTitle,
    };
  }
}
