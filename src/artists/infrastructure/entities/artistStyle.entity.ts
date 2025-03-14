import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Artist } from './artist.entity';
import { ArtistStyleType } from '../../domain/artistStyleType';
import { CreateDateColumn } from 'typeorm';

@Entity('artist_styles')
export class ArtistStyle implements ArtistStyleType {
  @PrimaryColumn({ name: 'artist_id' })
  artistId: number;

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