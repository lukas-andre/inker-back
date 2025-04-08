import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Artist } from '../entities/artist.entity';
import { Contact } from '../entities/contact.entity';

import { ArtistRepository } from './artist.repository';
import { ContactRepository } from './contact.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Contact], 'artist-db')],
  providers: [ArtistRepository, ContactRepository],
  exports: [ArtistRepository, ContactRepository],
})
export class ArtistsRepositoryModule {}
