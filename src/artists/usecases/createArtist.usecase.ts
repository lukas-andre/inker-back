import { Injectable, Logger } from '@nestjs/common';
import { ArtistsService } from '../domain/services/artists.service';
import { handleServiceError } from '../../global/domain/utils/handleServiceError';
import { CreateArtistDto } from '../infrastructure/dtos/createArtist.dto';
import { Artist } from '../infrastructure/entities/artist.entity';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { AgendaService } from '../../agenda/domain/agenda.service';
import { Agenda } from '../../agenda/intrastructure/entities/agenda.entity';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';

@Injectable()
export class CreateArtistUseCase {
  private readonly serviceName = CreateArtistUseCase.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(
    private readonly artistsService: ArtistsService,
    private readonly agendaService: AgendaService,
  ) {}

  async execute(
    createArtistdto: CreateArtistDto,
  ): Promise<Artist | DomainException> {
    const created = await this.artistsService.create(createArtistdto);
    if (isServiceError(created)) {
      return new DomainConflictException(
        handleServiceError(created, this.logger),
      );
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
      return new DomainConflictException(
        handleServiceError(savedAgenda, this.logger),
      );
    }

    return created;
  }
}
