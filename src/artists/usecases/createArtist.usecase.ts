import { Injectable } from '@nestjs/common';

import { Agenda } from '../../agenda/infrastructure/entities/agenda.entity';
import { AgendaRepository } from '../../agenda/infrastructure/repositories/agenda.repository';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { Artist } from '../infrastructure/entities/artist.entity';
import { ArtistRepository } from '../infrastructure/repositories/artist.repository';

import { CreateArtistParams } from './interfaces/createArtist.params';

@Injectable()
export class CreateArtistUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly artistProvider: ArtistRepository,
    private readonly agendaProvider: AgendaRepository,
  ) {
    super(CreateArtistUseCase.name);
  }

  async execute(createArtistDto: CreateArtistParams): Promise<Artist> {
    const created = await this.artistProvider.create(createArtistDto);

    const agenda: Partial<Agenda> = {
      open: createArtistDto.agendaIsOpen,
      public: createArtistDto.agendaIsPublic,
      userId: createArtistDto.userId,
      workingDays: createArtistDto.agendaWorkingDays,
    };

    await this.agendaProvider.save(agenda);

    return created;
  }
}
