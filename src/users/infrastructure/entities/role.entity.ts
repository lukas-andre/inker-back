import {
  Entity,
  Column,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Permission } from './permission.entity';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

@Entity()
export class Role extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(type => Permission, { cascade: false })
  @JoinTable({ name: 'role_permission' })
  permissions: Permission[];
}
