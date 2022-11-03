import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Artist } from '../entities/artist.entity';
import { Contact } from '../entities/contact.entity';

import { ArtistsDbService } from './services/artistsDb.service';
import { ContactDbService } from './services/contactDb.service';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Contact], 'artist-db')],
  providers: [ArtistsDbService, ContactDbService],
  exports: [ArtistsDbService, ContactDbService],
})
export class ArtistsDbModule {}
