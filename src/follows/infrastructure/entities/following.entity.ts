import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { UserType } from '../../../users/domain/enums/userType.enum';

@Entity()
export class Following extends BaseEntity {
  @Index()
  @Column({ name: 'user_following_id' })
  userFollowingId: string;

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
