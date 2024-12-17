import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { User } from '../../../users/infrastructure/entities/user.entity';

@Entity()
export class Settings extends BaseEntity {
  @Column()
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: true })
  notificationsEnabled: boolean;

  @Column({ default: true })
  locationServicesEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;
}