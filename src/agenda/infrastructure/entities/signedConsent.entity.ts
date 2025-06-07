import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AgendaEvent } from './agendaEvent.entity';
import { FormTemplateEntity } from './formTemplate.entity';

@Entity('signed_consents')
export class SignedConsentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgendaEvent, { onDelete: 'CASCADE' })
  event: AgendaEvent;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId: string;

  @ManyToOne(() => FormTemplateEntity, { eager: false, onDelete: 'SET NULL', nullable: true })
  formTemplate?: FormTemplateEntity;

  @Column({ type: 'uuid', nullable: true, name: 'form_template_id' })
  formTemplateId?: string;

  @Column({ type: 'jsonb', name: 'signed_data' })
  signedData: Record<string, any>;

  @Column({ name: 'digital_signature' })
  digitalSignature: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'signed_at' })
  signedAt: Date;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string; // User who signed the consent

  // Optional: IP address, user agent for audit purposes
  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent?: string;
} 