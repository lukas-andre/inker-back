import { Column, Entity, ManyToMany } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

import { Artist } from './artist.entity';

export const SERVICE_TYPES = ['Barber', 'Tattoo Artist'] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

@Entity()
export class Service extends BaseEntity {
  @Column({
    type: 'enum',
    enum: SERVICE_TYPES,
    enumName: 'service_name',
    unique: true,
  })
  name: ServiceType;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Artist, artist => artist.services)
  artists: Artist[];
}
