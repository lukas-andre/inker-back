import { AgendaJobType } from '../../domain/schemas/agenda';

export abstract class AgendaEventJob {
  abstract handle(job: AgendaJobType): Promise<void>;
}
