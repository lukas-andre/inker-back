import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserType } from '../../../users/domain/enums/userType.enum';

@Entity('token_balance')
@Index('idx_user_type_id', ['userTypeId'])
@Index('idx_user_type', ['userType'])
@Index('idx_balance', ['balance'])
@Index('idx_created_at', ['createdAt'])
export class TokenBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
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

  @Column({ type: 'int', default: 0 })
  balance: number;

  @Column({ name: 'total_purchased', type: 'int', default: 0 })
  totalPurchased: number;

  @Column({ name: 'total_consumed', type: 'int', default: 0 })
  totalConsumed: number;

  @Column({ name: 'total_granted', type: 'int', default: 0 })
  totalGranted: number;

  @Column({ name: 'last_purchase_at', type: 'timestamp', nullable: true })
  lastPurchaseAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}