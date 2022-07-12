import { Injectable } from '@nestjs/common';
import { AgendaService } from '../../agenda/domain/agenda.service';
import { Agenda } from '../../agenda/infrastructure/entities/agenda.entity';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistsDbService } from '../infrastructure/database/services/artistsDb.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { CreateArtistParams } from './interfaces/createArtist.params';

@Injectable()
export class CreateArtistUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly artistsDbService: ArtistsDbService,
    private readonly agendaService: AgendaService,
  ) {
    super(CreateArtistUseCase.name);
  }

  async execute(createArtistDto: CreateArtistParams): Promise<Artist> {
    const created = await this.artistsDbService.create(createArtistDto);

    const agenda: Partial<Agenda> = {
      open: createArtistDto.agendaIsOpen,
      public: createArtistDto.agendaIsPublic,
      userId: createArtistDto.userId,
      workingDays: createArtistDto.agendaWorkingDays,
    };

    await this.agendaService.save(agenda);

    return created;
  }
}
