import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { ArtistsService } from '../domain/services/artists.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { AgendaService } from '../../agenda/domain/agenda.service';
import { CreateArtistDto } from '../infrastructure/dtos/createArtist.dto';
import { Agenda } from '../../agenda/intrastructure/entities/agenda.entity';

@Injectable()
export class CreateArtistUseCase extends BaseUseCase {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly agendaService: AgendaService,
  ) {
    super(CreateArtistUseCase.name);
  }

  async execute(
    createArtistdto: CreateArtistDto,
  ): Promise<Artist | DomainException> {
    const created = await this.artistsService.create(createArtistdto);
    if (isServiceError(created)) {
      return new DomainConflictException(this.handleServiceError(created));
    }
    const agenda: Partial<Agenda> = {
      open: createArtistdto.agendaIsOpen,
      public: createArtistdto.agendaIsPublic,
      userId: createArtistdto.userId,
      workingDays: createArtistdto.agendaWorkingDays,
    };

    const savedAgenda = await this.agendaService.save(agenda);
    if (isServiceError(savedAgenda)) {
      await this.artistsService.delete(created.id);
      return new DomainConflictException(this.handleServiceError(savedAgenda));
    }

    return created;
  }
}
