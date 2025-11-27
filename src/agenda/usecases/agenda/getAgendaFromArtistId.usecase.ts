import { Agenda } from "../../infrastructure/entities/agenda.entity";
import { AgendaRepository } from "../../infrastructure/repositories/agenda.repository";

export class GetAgendaFromArtistIdUseCase {
    constructor(private readonly agendaRepository: AgendaRepository) { }
    async execute(artistId: string): Promise<Agenda> {
        return this.agendaRepository.findByArtistId(artistId);
    }
}   