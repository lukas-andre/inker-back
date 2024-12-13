import { Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Index } from 'typeorm';

export enum DeviceType {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web'
}

@Entity('user_fcm_tokens')
@Index(['userId', 'token'], { unique: true }) 
export class UserFcmToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  token: string;

  @Column({
    name: 'device_type',
    type: 'enum',
    enum: DeviceType
  })
  deviceType: DeviceType;

  @Column({ 
    name: 'is_active',
    default: true 
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ 
    name: 'last_used_at',
    nullable: true
  })
  lastUsedAt: Date;
}