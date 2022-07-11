import { Point } from 'geojson';
import { Column, Entity, Index } from 'typeorm';
import { ViewportInterface } from '../../../global/domain/interfaces/geometry.interface';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

@Entity({ synchronize: false })
export class LocationEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  address1: string;

  @Column({ type: 'varchar' })
  address2: string;

  @Column({ type: 'varchar', nullable: true })
  address3?: string;

  @Column({ type: 'varchar', nullable: true })
  state?: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

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
