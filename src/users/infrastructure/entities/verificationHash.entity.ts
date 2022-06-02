import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

export enum NotificationType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum VerificationType {
  ACTIVATE_ACCOUNT = 'ACTIVATE_ACCOUNT',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}
@Entity()
export class VerificationHash extends BaseEntity {
  @Column({ name: 'user_id' }) userId: number;

  @Column() hash: string;

  @Column({ nullable: false }) tries: number;

  @Column({ name: 'notification_type', enum: NotificationType })
  notificationType: NotificationType;

  @Column({ name: 'verification_type', enum: VerificationType })
  verificationType: VerificationType;
}
