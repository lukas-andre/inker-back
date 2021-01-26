import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';

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
  partenId: number;

  @Column()
  username: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;
}
