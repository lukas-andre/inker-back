import { Injectable } from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { serviceErrorStringify } from '../../global/domain/utils/serviceErrorStringify';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { CreateArtistDto } from '../infrastructure/dtos/createArtist.dto';
import { Artist } from '../infrastructure/entities/artist.entity';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { AgendaService } from '../../agenda/domain/agenda.service';
import { create } from 'domain';
import { Agenda } from '../../agenda/intrastructure/entities/agenda.entity';

@Injectable()
export class CreateArtistUseCase {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly agendaService: AgendaService,
  ) {}

  async execute(
    createArtistdto: CreateArtistDto,
  ): Promise<Artist | DomainException> {
    const created = await this.artistsService.create(createArtistdto);
    if (created instanceof ServiceError) {
      return new DomainConflictException(serviceErrorStringify(created));
    }
    const agenda: Partial<Agenda> = {
      open: createArtistdto.agendaIsOpen,
      public: createArtistdto.agendaIsPublic,
      userId: createArtistdto.userId,
      workingDays: createArtistdto.agendaWorkingDays,
    };

    const savedAgenda = await this.agendaService.save(agenda);
    if (savedAgenda instanceof ServiceError) {
      await this.artistsService.delete(created.id);
      return new DomainConflictException(serviceErrorStringify(savedAgenda));
    }

    return created;
  }
}
