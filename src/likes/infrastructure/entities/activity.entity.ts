import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Activity extends BaseEntity {
  @Column({ default: 0 })
  likes: number;
}
