import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { UserType } from '../../domain/enums/userType.enum';
import { IUser } from '../../domain/models/user.model';

@Entity()
export class User {
  @PrimaryColumn({ generated: 'uuid' })
  id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: true })
  active: boolean;

  @Column({ enum: UserType })
  @Index()
  userType: string;

  @ManyToOne(type => Role, { cascade: false, nullable: true })
  role: Role;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
