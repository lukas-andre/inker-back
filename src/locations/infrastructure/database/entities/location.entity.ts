import { Point } from 'geojson';
import { Column, Entity, Index } from 'typeorm';

import { AddressType } from '../../../../global/domain/interfaces/address.interface';
import { ViewportInterface } from '../../../../global/domain/interfaces/geometry.interface';
import { BaseEntity } from '../../../../global/infrastructure/entities/base.entity';
import { LocationModel } from '../../../domain/model/location.model';

@Entity({ synchronize: false })
export class LocationEntity extends BaseEntity implements LocationModel {
  @Column({ type: 'varchar', length: 100 })
  address1: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'short_address1',
    nullable: true,
  })
  shortAddress1: string;

  @Column({ type: 'varchar', length: 50 })
  address2: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  address3?: string;

  @Column({
    type: 'enum',
    enum: AddressType,
    enumName: 'AddressType',
    name: 'address_type',
    default: AddressType.HOME,
  })
  addressType: AddressType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true, length: 20 })
  country?: string;

  @Column({
    name: 'formatted_address',
    type: 'varchar',
    nullable: true,
    length: 255,
  })
  formattedAddress?: string;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  lng: number;

  @Column({ type: 'jsonb', nullable: true })
  viewport?: ViewportInterface;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point;
}
