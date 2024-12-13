import { Column, Entity, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { JobTypeKey, JobTypeSchemaRegistry } from '../../../queues/notifications/domain/jobSchema.registry';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({
    type: 'enum',
    enum: Object.keys(JobTypeSchemaRegistry),
    enumName: 'job_type_key'
  })
  type: JobTypeKey;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}