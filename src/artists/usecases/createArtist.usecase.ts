import { Injectable } from '@nestjs/common';
import { AgendaService } from '../../agenda/domain/agenda.service';
import { Agenda } from '../../agenda/infrastructure/entities/agenda.entity';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistsService } from '../domain/services/artists.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { CreateArtistParams } from './interfaces/createArtist.params';

@Injectable()
export class CreateArtistUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly agendaService: AgendaService,
  ) {
    super(CreateArtistUseCase.name);
  }

  async execute(
    createArtistDto: CreateArtistParams,
  ): Promise<Artist | DomainException> {
    const created = await this.artistsService.create(createArtistDto);
    if (isServiceError(created)) {
      return new DomainConflictException(this.handleServiceError(created));
    }
    const agenda: Partial<Agenda> = {
      open: createArtistDto.agendaIsOpen,
      public: createArtistDto.agendaIsPublic,
      userId: createArtistDto.userId,
      workingDays: createArtistDto.agendaWorkingDays,
    };

    const savedAgenda = await this.agendaService.save(agenda);
    if (isServiceError(savedAgenda)) {
      await this.artistsService.delete(created.id);
      return new DomainConflictException(this.handleServiceError(savedAgenda));
    }

    return created;
  }
}
