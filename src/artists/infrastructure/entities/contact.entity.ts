import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Artist } from './artist.entity';

@Entity()
export class Contact extends BaseEntity {
  @OneToOne(() => Artist, artist => artist.contact)
  artist: Artist;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ name: 'phone_dial_code' })
  phoneDialCode: string;

  @Column({ name: 'phone_country_iso_code' })
  phoneCountryIsoCode: string;
}
