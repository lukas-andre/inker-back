import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignedConsentEntity } from '../../../agenda/infrastructure/entities/signedConsent.entity';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { ISignedConsentRepository, ISignedConsentData } from '../../domain/interfaces/signed-consent-repository.interface';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';

@Injectable()
export class SignedConsentRepository implements ISignedConsentRepository {
  constructor(
    @InjectRepository(SignedConsentEntity, AGENDA_DB_CONNECTION_NAME)
    private readonly repository: Repository<SignedConsentEntity>,
    private readonly requestContextService: RequestContextService,
  ) {}

  async create(data: ISignedConsentData): Promise<SignedConsentEntity> {
    const newSignedConsent = this.repository.create(data);
    // signedAt is handled by @CreateDateColumn in the entity
    return this.repository.save(newSignedConsent);
  }

  async findById(id: string): Promise<SignedConsentEntity | null> {
    return this.repository.findOneBy({ id });
  }

  async findByEventId(eventId: string): Promise<SignedConsentEntity[]> {
    return this.repository.find({ where: { eventId }, order: { signedAt: 'DESC' } });
  }

  async findByUserId(userId: string): Promise<SignedConsentEntity[]> {
    return this.repository.find({ where: { userId }, order: { signedAt: 'DESC' } });
  }

  async findByTemplateId(templateId: string): Promise<SignedConsentEntity[]> {
    return this.repository.find({ where: { formTemplateId: templateId }, order: { signedAt: 'DESC' } });
  }

  // You might also need a method to find a specific consent for an event and user
  async findByEventAndUser(eventId: string, userId: string): Promise<SignedConsentEntity | null> {
    return this.repository.findOne({ where: { eventId, userId } });
  }

  async findByEventUserAndTemplate(eventId: string, userId: string, formTemplateId?: string): Promise<SignedConsentEntity | null> {
    if (formTemplateId) {
      return this.repository.findOne({ where: { eventId, userId, formTemplateId } });
    }
    // If no formTemplateId is provided, it implies a general consent for the event not tied to a specific template,
    // or the check is for any consent by the user for the event.
    // This part of the logic might need refinement based on how consents without specific templates are handled.
    return this.repository.findOne({ where: { eventId, userId, formTemplateId: null } }); // Or simply { eventId, userId } if any signature counts
  }

  async findByEventIdAndUserId(eventId: string, userId: string): Promise<SignedConsentEntity[]> {
    return this.repository.find({
      where: { eventId, userId },
      relations: ['formTemplate'],
      order: { signedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SignedConsentEntity | null> {
    return this.repository.findOne({ 
        where: { id }, 
        relations: ['formTemplate', 'event'] 
    });
  }
  
  async getRequiredConsentsForEvent(eventId: string): Promise<SignedConsentEntity[]> {
    // This method needs more complex logic to determine *which* consents are *required*
    // For now, it returns all signed consents for the event. 
    // The actual logic might involve checking event type, linked templates, etc.
    // This is a placeholder and will need to be refined based on how "required" is defined.
    return this.findByEventId(eventId);
  }

  // Add other methods as needed
} 