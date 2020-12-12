import { UserType } from '../../../users/domain/enums/userType.enum';
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

@Entity()
export class Following extends BaseEntity  {
  @Index()
  @Column({ name: 'user_following_id' })
  userFollowingId: number;

  @Index()
  @Column({ name: 'user_id'})
  userId: number;
  
  @Index()
  @Column({ name: 'user_type_id' })
  userTypeId: number;

  @Column({ name: 'user_type', enum: UserType })
  userType: string;

  @Column()
  username: string;

  @Column()
  fullname: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;
}
