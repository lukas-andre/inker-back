import { Entity } from 'typeorm';
import { LocationEntity } from './location.entity';

@Entity()
export class EventLocation extends LocationEntity {}
