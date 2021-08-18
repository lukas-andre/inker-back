import { Column, DeleteDateColumn, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

@Entity()
export class Comment extends BaseEntity {
  @Column()
  content: string;

  @Index()
  @Column({ nullable: true })
  location: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @Index()
  @Column({ name: 'user_type_id' })
  userTypeId: number;

  @Index()
  @Column({ name: 'user_type' })
  userType: string;

  @Index()
  @Column({ name: 'parent_type' })
  parentType: string;

  @Index()
  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @Column()
  username: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
