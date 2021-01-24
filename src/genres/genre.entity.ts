import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../global/infrastructure/entities/base.entity';

@Entity()
export class Genrer extends BaseEntity {
  @Column()
  name: string;

  @Column('text', { name: 'created_by', nullable: true })
  createdBy: string;
}
