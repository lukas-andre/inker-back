import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @Column()
  content: string;

  @Index()
  @Column({ nullable: true })
  location: boolean;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Index()
  @Column({ name: 'post_id' })
  postId: string;

  @Index()
  @Column({ name: 'parent_id', nullable: true })
  partenId: string;

  @Column()
  username: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;
}
