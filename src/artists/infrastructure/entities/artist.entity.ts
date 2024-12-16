import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { ArtistType } from '../../domain/artistType';
import { Service } from './service.entity';
import { Contact } from './contact.entity';



@Entity()
@Index(['firstName', 'lastName', 'username']) // Índice compuesto para búsquedas por nombre
@Index(['rating']) // Índice para ordenamiento y filtrado por rating
@Index(['deletedAt']) // Índice para el soft delete
export class Artist extends BaseEntity implements ArtistType {
  @Column({ name: 'user_id' })
  @Index() // Índice para búsquedas por userId
  userId: number;

  @Column({ name: 'username' })
  @Index() // Índice individual para búsquedas por username
  username: string;

  @ManyToMany(() => Service, service => service.artists)
  @JoinTable({
    name: 'artist_services', // Nombre explícito para la tabla de relación
    joinColumn: {
      name: 'artist_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'service_id',
      referencedColumnName: 'id'
    }
  })
  services: Service[];

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'short_description', nullable: true, type: 'text' })
  shortDescription?: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail?: string;

  @Column({ default: 0 })
  profileThumbnailVersion: number;

  @OneToOne(() => Contact, contact => contact.artist, {
    cascade: true,
    eager: true // Cargar automáticamente el contacto
  })
  @JoinColumn({
    name: 'contact_id',
    foreignKeyConstraintName: 'fk_artist_contact' // Nombre explícito para la FK
  })
  contact: Contact;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    default: 0.0,
    comment: 'Artist rating from 0.0 to 5.0'
  })
  rating: number;

  @Column({ name: 'studio_photo', nullable: true })
  studioPhoto?: string;

  @Column({ default: 0 })
  studioPhotoVersion: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}