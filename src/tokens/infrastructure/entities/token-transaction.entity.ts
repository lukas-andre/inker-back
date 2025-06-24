import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserType } from '../../../users/domain/enums/userType.enum';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { TransactionType } from '../../domain/enums/transaction-type.enum';

@Entity('token_transaction')
@Index('idx_user_id', ['userId'])
@Index('idx_user_type_id', ['userTypeId'])
@Index('idx_type', ['type'])
@Index('idx_status', ['status'])
@Index('idx_created_at', ['createdAt'])
@Index('idx_transaction_audit', ['createdAt', 'userId', 'type', 'status'])
export class TokenTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    name: 'user_type',
    type: 'varchar',
    length: 50,
    enum: UserType,
  })
  userType: UserType;

  @Column({ name: 'user_type_id' })
  userTypeId: string;

  @Column({
    type: 'varchar',
    length: 50,
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'int' })
  amount: number;

  @Column({ name: 'balance_before', type: 'int' })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'int' })
  balanceAfter: number;

  @Column({
    type: 'varchar',
    length: 50,
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    // Para PURCHASE
    paymentMethod?: string;
    paymentReference?: string;
    packageId?: string;
    price?: number;
    currency?: string;
    
    // Para CONSUME
    tattooGenerationId?: string;
    imageUrl?: string;
    prompt?: string;
    runwareCost?: number;
    
    // Para GRANT o MANUAL_ADJUSTMENT
    reason?: string;
    grantedBy?: string;
    adminUserId?: string;
    promotionId?: string;
    promotionType?: string;
    registrationDate?: Date;
    grantedAt?: Date;
    grantedVia?: string;
    timestamp?: Date;
  };

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}