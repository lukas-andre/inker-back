import { Column, Entity, Index, Unique } from 'typeorm';

import { LocationEntity } from './location.entity';

@Entity()
@Unique(['artistId', 'locationOrder']) // Ensure unique combination of artist and order
export class ArtistLocation extends LocationEntity {
  @Index()
  @Column({ name: 'artist_id', nullable: true })
  artistId: number;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail?: string;

  @Column({ name: 'google_place_id', nullable: true })
  googlePlaceId?: string;
  
  @Column({ name: 'location_order', default: 0 })
  locationOrder: number;
  
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
