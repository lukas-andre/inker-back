import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { Role } from './role.entity';
import { UserType } from '../../domain/enums/userType.enum';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  password: string;

  @Column({ enum: UserType })
  @Index()
  userType: string;

  @ManyToOne((type) => Role, { cascade: false, nullable: true })
  role: Role;

  @Column({ nullable: false, default: false })
  active: boolean = false;
}
