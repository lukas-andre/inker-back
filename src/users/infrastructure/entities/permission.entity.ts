import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

@Entity()
export class Permission extends BaseEntity {
  @Column({ unique: true })
  controller: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  description: string;
}
