import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Follower {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'artist_id' })
  artistId: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  username: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
