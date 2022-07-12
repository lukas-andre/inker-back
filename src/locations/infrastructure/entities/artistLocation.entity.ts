import { Column, Entity, Index } from 'typeorm';
import { LocationEntity } from './location.entity';

@Entity()
export class ArtistLocation extends LocationEntity {
  @Index()
  @Column({ name: 'artist_id', nullable: true })
  artistId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail?: string;

  @Column({ name: 'google_place_id', nullable: true })
  googlePlaceId?: string;
}
