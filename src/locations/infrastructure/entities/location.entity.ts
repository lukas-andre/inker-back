import { Point } from 'geojson';
import { Column, Entity, Index } from 'typeorm';
import { ViewportInterface } from '../../../global/domain/interfaces/geometry.interface';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

@Entity({ synchronize: false })
export class LocationEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  address1: string;

  @Column({ type: 'varchar', length: 50 })
  address2: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  address3?: string;

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
