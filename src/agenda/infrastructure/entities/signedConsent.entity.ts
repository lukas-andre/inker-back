import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AgendaEvent } from './agendaEvent.entity';
import { FormTemplateEntity } from './formTemplate.entity';

@Entity('signed_consents')
export class SignedConsentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AgendaEvent, { onDelete: 'CASCADE' })
  event: AgendaEvent;

  @Column('uuid')
  eventId: string;

  @ManyToOne(() => FormTemplateEntity, { eager: false, onDelete: 'SET NULL', nullable: true })
  formTemplate?: FormTemplateEntity;

  @Column('uuid', { nullable: true })
  formTemplateId?: string;

  @Column('jsonb')
  signedData: Record<string, any>;

  @Column()
  digitalSignature: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  signedAt: Date;

  @Column('uuid')
  userId: string; // User who signed the consent

  // Optional: IP address, user agent for audit purposes
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;
} 