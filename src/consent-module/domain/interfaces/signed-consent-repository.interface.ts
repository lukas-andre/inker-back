import { SignedConsentEntity } from '../../../agenda/infrastructure/entities/signedConsent.entity';
import { SignConsentDto } from '../dtos/sign-consent.dto';

export interface ISignedConsentData extends Omit<SignConsentDto, 'ipAddress' | 'userAgent'> {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  // signedAt will be set by the database or entity default
}

export interface ISignedConsentRepository {
  create(data: ISignedConsentData): Promise<SignedConsentEntity>;
  findById(id: string): Promise<SignedConsentEntity | null>;
  findByEventId(eventId: string): Promise<SignedConsentEntity[]>;
  findByUserId(userId: string): Promise<SignedConsentEntity[]>;
  findByTemplateId(templateId: string): Promise<SignedConsentEntity[]>;
  // Add other methods as needed
}

export const ISignedConsentRepository = Symbol('ISignedConsentRepository'); 