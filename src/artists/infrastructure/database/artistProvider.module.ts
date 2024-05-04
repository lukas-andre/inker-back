import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Artist } from '../entities/artist.entity';
import { Contact } from '../entities/contact.entity';

import { ArtistProvider } from './artist.provider';
import { ContactProvider } from './contact.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Contact], 'artist-db')],
  providers: [ArtistProvider, ContactProvider],
  exports: [ArtistProvider, ContactProvider],
})
export class ArtistsProviderModule {}
