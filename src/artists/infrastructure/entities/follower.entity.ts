import { UserType } from '../../../users/domain/enums/userType.enum';
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

@Entity()
export class Follower extends BaseEntity {
  @Index()
  @Column({ name: 'artist_id' })
  artistId: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Index()
  @Column({ name: 'user_type_id' })
  userTypeId: string;

  @Column({ name: 'user_type', enum: UserType })
  userType: string;

  @Column()
  username: string;

  @Column()
  fullname: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;
}
