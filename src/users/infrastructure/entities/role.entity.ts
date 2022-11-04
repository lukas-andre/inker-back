import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

import { Permission } from './permission.entity';

@Entity()
export class Role extends BaseEntity {
  @Column()
  @Index()
  name: string;

  @Column()
  description: string;

  @ManyToMany(type => Permission, { cascade: false })
  @JoinTable({ name: 'role_permission' })
  permissions: Permission[];
}
