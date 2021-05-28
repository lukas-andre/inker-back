import { Column, Entity } from 'typeorm';
import { LocationEntity } from './location.entity';

@Entity()
export class ArtistLocation extends LocationEntity {
  @Column({ name: 'artist_id', nullable: true })
  artistId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;
}
