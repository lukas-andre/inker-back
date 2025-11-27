import { Column, Entity, Index, ManyToMany } from 'typeorm';

import { BaseEntity } from '../global/infrastructure/entities/base.entity';

@Entity()
export class Tag extends BaseEntity {
  @Index()
  @Column()
  name: string;

  @Column('text', { name: 'created_by', nullable: true })
  createdBy: string;
}
