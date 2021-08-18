import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { UserType } from '../../domain/enums/userType.enum';
import { Role } from './role.entity';

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
