import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../global/infrastructure/entities/base.entity';

@Entity()
export class Genrer extends BaseEntity {
  @Index()
  @Column()
  name: string;

  @Column('text', { name: 'created_by', nullable: true })
  createdBy: string;
}
