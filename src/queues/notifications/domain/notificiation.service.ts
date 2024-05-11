export abstract class AgendaEvent {}

export class AgendaEventCreatedNotification implements AgendaEvent {
  constructor(
    public customerId: number,
    public artistId: number,
    public eventId: Date,
  ) {}
}

export class CustomerEventCreatedNotification implements AgendaEvent {
  constructor(
    public customerName: string,
    public location: string,
    public eventDate: Date,
  ) {}
}

export class CustomerRsvpAcceptedNotification implements AgendaEvent {}

export class CustomerRsvpDeclinedNotification implements AgendaEvent {}

export class CustomerRsvpUnschedulableNotification implements AgendaEvent {}

export interface INotificationService {
  sendAgendaEvent(notification: AgendaEvent): Promise<void>;
}
