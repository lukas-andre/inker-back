import { Column, DeleteDateColumn, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { UserType } from '../../domain/enums/userType.enum';
import { Role } from './role.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: true, length: 20 })
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'user_type', enum: UserType })
  @Index()
  userType: string;

  @ManyToOne(type => Role, { cascade: false, nullable: true })
  role: Role;

  @Column({ nullable: false, default: false })
  active: boolean;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
