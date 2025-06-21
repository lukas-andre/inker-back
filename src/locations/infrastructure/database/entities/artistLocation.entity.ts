import { Column, Entity } from 'typeorm';

import { LocationEntity } from './location.entity';

@Entity()
export class ArtistLocation extends LocationEntity {
  @Column({ name: 'artist_id', type: 'uuid', nullable: true })
  artistId: string;

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
