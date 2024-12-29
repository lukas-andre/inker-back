import { JobType } from '../../domain/schemas/job';

export abstract class NotificationJob {
  abstract handle(job: JobType): Promise<void>;
}

export function getGoogleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=map&center=${lat}%2C${lng}`;
}
