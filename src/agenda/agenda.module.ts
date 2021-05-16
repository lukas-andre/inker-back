import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsModule } from '../artists/artists.module';
import { Agenda } from './intrastructure/entities/agenda.entity';
import { AgendaEvent } from './intrastructure/entities/agendaEvent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agenda, AgendaEvent], 'agenda-db'),
    ArtistsModule,
  ],
  providers: [
  ],
  controllers: [],
  exports: [],
})
export class AgendaModule {}
