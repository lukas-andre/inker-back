import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';
import { TagInterface } from '../../../tags/tag.interface';
import { GenrerInterface } from '../../../genres/genre.interface';
import { MultimediasMetadaInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface copy';

@Entity()
export class Post extends BaseEntity {
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

  @Column()
  username: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;

  @Column('jsonb', { nullable: true })
  multimedia: MultimediasMetadaInterface;

  @Column('jsonb', { nullable: true })
  tags: TagInterface[];

  @Column('jsonb', { nullable: true })
  genres: GenrerInterface[];
}
