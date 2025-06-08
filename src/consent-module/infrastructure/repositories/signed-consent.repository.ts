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
    const query = `
      INSERT INTO signed_consents (
        event_id, form_template_id, signed_data, 
        digital_signature, user_id, ip_address, user_agent, signed_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, now()
      ) RETURNING json_build_object(
        'id', id,
        'eventId', event_id,
        'formTemplateId', form_template_id,
        'signedData', signed_data,
        'digitalSignature', digital_signature,
        'userId', user_id,
        'ipAddress', ip_address,
        'userAgent', user_agent,
        'signedAt', signed_at
      ) as result;
    `;
    
    const result = await this.repository.query(query, [
      data.eventId,
      data.formTemplateId,
      data.signedData,
      data.digitalSignature,
      data.userId,
      data.ipAddress,
      data.userAgent
    ]);
    
    return result[0].result;
  }

  async findById(id: string): Promise<SignedConsentEntity | null> {
    const query = `
      SELECT json_build_object(
        'id', sc.id,
        'eventId', sc.event_id,
        'formTemplateId', sc.form_template_id,
        'signedData', sc.signed_data,
        'digitalSignature', sc.digital_signature,
        'userId', sc.user_id,
        'ipAddress', sc.ip_address,
        'userAgent', sc.user_agent,
        'signedAt', sc.signed_at
      ) as result
      FROM signed_consents sc
      WHERE sc.id = $1;
    `;
    const result = await this.repository.query(query, [id]);
    return result[0]?.result || null;
  }

  async findByEventId(eventId: string): Promise<SignedConsentEntity[]> {
    const query = `
      SELECT json_build_object(
        'id', sc.id,
        'eventId', sc.event_id,
        'formTemplateId', sc.form_template_id,
        'signedData', sc.signed_data,
        'digitalSignature', sc.digital_signature,
        'userId', sc.user_id,
        'ipAddress', sc.ip_address,
        'userAgent', sc.user_agent,
        'signedAt', sc.signed_at
      ) as result
      FROM signed_consents sc
      WHERE sc.event_id = $1 
      ORDER BY sc.signed_at DESC;
    `;
    const result = await this.repository.query(query, [eventId]);
    return result.map(r => r.result);
  }

  async findByUserId(userId: string): Promise<SignedConsentEntity[]> {
    const query = `
      SELECT json_build_object(
        'id', sc.id,
        'eventId', sc.event_id,
        'formTemplateId', sc.form_template_id,
        'signedData', sc.signed_data,
        'digitalSignature', sc.digital_signature,
        'userId', sc.user_id,
        'ipAddress', sc.ip_address,
        'userAgent', sc.user_agent,
        'signedAt', sc.signed_at
      ) as result
      FROM signed_consents sc
      WHERE sc.user_id = $1 
      ORDER BY sc.signed_at DESC;
    `;
    const result = await this.repository.query(query, [userId]);
    return result.map(r => r.result);
  }

  async findByTemplateId(templateId: string): Promise<SignedConsentEntity[]> {
    const query = `
      SELECT json_build_object(
        'id', sc.id,
        'eventId', sc.event_id,
        'formTemplateId', sc.form_template_id,
        'signedData', sc.signed_data,
        'digitalSignature', sc.digital_signature,
        'userId', sc.user_id,
        'ipAddress', sc.ip_address,
        'userAgent', sc.user_agent,
        'signedAt', sc.signed_at
      ) as result
      FROM signed_consents sc
      WHERE sc.form_template_id = $1 
      ORDER BY sc.signed_at DESC;
    `;
    const result = await this.repository.query(query, [templateId]);
    return result.map(r => r.result);
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<SignedConsentEntity | null> {
    const query = `
      SELECT json_build_object(
        'id', sc.id,
        'eventId', sc.event_id,
        'formTemplateId', sc.form_template_id,
        'signedData', sc.signed_data,
        'digitalSignature', sc.digital_signature,
        'userId', sc.user_id,
        'ipAddress', sc.ip_address,
        'userAgent', sc.user_agent,
        'signedAt', sc.signed_at
      ) as result
      FROM signed_consents sc
      WHERE sc.event_id = $1 AND sc.user_id = $2;
    `;
    const result = await this.repository.query(query, [eventId, userId]);
    return result[0]?.result || null;
  }

  async findByEventUserAndTemplate(eventId: string, userId: string, formTemplateId?: string): Promise<SignedConsentEntity | null> {
    let query = `
      SELECT json_build_object(
        'id', sc.id,
        'eventId', sc.event_id,
        'formTemplateId', sc.form_template_id,
        'signedData', sc.signed_data,
        'digitalSignature', sc.digital_signature,
        'userId', sc.user_id,
        'ipAddress', sc.ip_address,
        'userAgent', sc.user_agent,
        'signedAt', sc.signed_at
      ) as result
      FROM signed_consents sc
      WHERE sc.event_id = $1 AND sc.user_id = $2
    `;
    const params = [eventId, userId];

    if (formTemplateId) {
      query += ` AND sc.form_template_id = $3`;
      params.push(formTemplateId);
    } else {
      query += ` AND sc.form_template_id IS NULL`;
    }

    const result = await this.repository.query(query, params);
    return result[0]?.result || null;
  }

  async findByEventIdAndUserId(eventId: string, userId: string): Promise<SignedConsentEntity[]> {
    const query = `
      SELECT json_build_object(
        'id', sc.id,
        'eventId', sc.event_id,
        'formTemplateId', sc.form_template_id,
        'signedData', sc.signed_data,
        'digitalSignature', sc.digital_signature,
        'userId', sc.user_id,
        'ipAddress', sc.ip_address,
        'userAgent', sc.user_agent,
        'signedAt', sc.signed_at,
        'formTemplate', CASE 
          WHEN ft.id IS NOT NULL THEN json_build_object(
            'id', ft.id,
            'name', ft.name,
            'description', ft.description,
            'createdAt', ft.created_at,
            'updatedAt', ft.updated_at
          )
          ELSE NULL
        END
      ) as result
      FROM signed_consents sc
      LEFT JOIN form_templates ft ON sc.form_template_id = ft.id
      WHERE sc.event_id = $1 AND sc.user_id = $2
      ORDER BY sc.signed_at DESC;
    `;
    const result = await this.repository.query(query, [eventId, userId]);
    return result.map(r => r.result);
  }

  async findOne(id: string): Promise<SignedConsentEntity | null> {
    const query = `
      SELECT json_build_object(
        'id', sc.id,
        'eventId', sc.event_id,
        'formTemplateId', sc.form_template_id,
        'signedData', sc.signed_data,
        'digitalSignature', sc.digital_signature,
        'userId', sc.user_id,
        'ipAddress', sc.ip_address,
        'userAgent', sc.user_agent,
        'signedAt', sc.signed_at,
        'formTemplate', CASE 
          WHEN ft.id IS NOT NULL THEN json_build_object(
            'id', ft.id,
            'name', ft.name,
            'description', ft.description,
            'createdAt', ft.created_at,
            'updatedAt', ft.updated_at
          )
          ELSE NULL
        END,
        'event', CASE 
          WHEN ae.id IS NOT NULL THEN json_build_object(
            'id', ae.id,
            'title', ae.title,
            'description', ae.description,
            'startDate', ae.start_date,
            'endDate', ae.end_date,
            'createdAt', ae.created_at,
            'updatedAt', ae.updated_at
          )
          ELSE NULL
        END
      ) as result
      FROM signed_consents sc
      LEFT JOIN form_templates ft ON sc.form_template_id = ft.id
      LEFT JOIN agenda_events ae ON sc.event_id = ae.id
      WHERE sc.id = $1;
    `;
    const result = await this.repository.query(query, [id]);
    return result[0]?.result || null;
  }

  async getRequiredConsentsForEvent(eventId: string): Promise<SignedConsentEntity[]> {
    const query = `
      SELECT json_build_object(
        'id', sc.id,
        'eventId', sc.event_id,
        'formTemplateId', sc.form_template_id,
        'signedData', sc.signed_data,
        'digitalSignature', sc.digital_signature,
        'userId', sc.user_id,
        'ipAddress', sc.ip_address,
        'userAgent', sc.user_agent,
        'signedAt', sc.signed_at
      ) as result
      FROM signed_consents sc
      WHERE sc.event_id = $1 
      ORDER BY sc.signed_at DESC;
    `;
    const result = await this.repository.query(query, [eventId]);
    return result.map(r => r.result);
  }
} 