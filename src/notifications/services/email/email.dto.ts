export abstract class BaseEmailDto {
  to: string;
  subject: string;
}

export class AgendaEventCreatedDto extends BaseEmailDto {
  customerId: string;
  eventName: string;
  eventDate: Date;
}

export class AgendaEventCanceledDto extends BaseEmailDto {
  customerId: string;
  eventName: string;
  eventDate: Date;
}

export class AgendaEventReminderDto extends BaseEmailDto {
  customerId: string;
  eventName: string;
  eventDate: Date;
}

export class AgendaEventUpdatedDto extends BaseEmailDto {
  customerId: string;
  eventName: string;
  eventDate: Date;
}

export class RsvpAcceptedDto extends BaseEmailDto {
  customerId: string;
  eventDate: Date;
  hostName: string;
}

export class RsvpDeclinedDto extends BaseEmailDto {
  customerId: string;
  eventDate: Date;
  hostName: string;
}

export class RsvpUnschedulableDto extends BaseEmailDto {
  customerId: string;
  eventDate: Date;
  hostName: string;
}
