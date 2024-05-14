import { AgendaJobType } from '../../domain/schemas/agenda';

export abstract class AgendaEventJob {
  abstract handle(job: AgendaJobType): Promise<void>;
}

export function getGoogleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=map&center=${lat}%2C${lng}`;
}
