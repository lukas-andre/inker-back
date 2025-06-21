import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { ArtistStyleType } from '../../domain/artistStyleType';

import { Artist } from './artist.entity';

@Entity('artist_styles')
export class ArtistStyle implements ArtistStyleType {
  @PrimaryColumn({ name: 'artist_id' })
  artistId: string;

  @ManyToOne(() => Artist, artist => artist.styles)
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @PrimaryColumn({ name: 'style_name' })
  styleName: string;

  @Column({ name: 'proficiency_level', default: 3 })
  proficiencyLevel: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
