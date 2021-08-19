import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

export enum VerificationType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

@Entity()
export class VerificationHash extends BaseEntity {
  @Column() userId: number;
  @Column() hash: string;
  @Column({ nullable: false }) tries: number;
  @Column({ enum: VerificationType }) verificationType: VerificationType;
}
