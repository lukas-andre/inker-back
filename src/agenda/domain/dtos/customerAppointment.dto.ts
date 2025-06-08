import { ApiProperty } from '@nestjs/swagger';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { AppointmentAction } from '../enum/appointmentAction.enum';
import { AppointmentUrgencyLevel } from '../enum/appointmentUrgencyLevel.enum';
import { AppointmentContextualInfo } from './appointmentContextualInfo.dto';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { ArtistLocation } from '../../../locations/infrastructure/database/entities/artistLocation.entity';

export class CustomerAppointmentDto {
  @ApiProperty({
    description: 'The raw agenda event object.',
  })
  event: AgendaEvent;

  @ApiProperty({
    description: 'The artist associated with the appointment.',
  })
  artist: Artist;

  @ApiProperty({
    description: 'The location where the appointment will take place.',
  })
  location: ArtistLocation;

  @ApiProperty({
    description: 'The calculated urgency level for the appointment.',
    enum: AppointmentUrgencyLevel,
    example: AppointmentUrgencyLevel.CRITICAL,
  })
  urgency: AppointmentUrgencyLevel;

  @ApiProperty({
    description:
      'An object containing human-readable texts for the UI, providing context about the appointment.',
  })
  contextualInfo: AppointmentContextualInfo;

  @ApiProperty({
    description:
      'A list of primary actions available for this event in a list view.',
    example: [AppointmentAction.CONFIRM, AppointmentAction.LEAVE_REVIEW],
    enum: AppointmentAction,
    isArray: true,
  })
  availableActions: AppointmentAction[];
} 