import { ApiProperty } from '@nestjs/swagger';
import { CustomerAppointmentDto } from '../../domain/dtos/customerAppointment.dto';

class GroupedAppointmentsDto {
  @ApiProperty({ type: [CustomerAppointmentDto], description: 'Events requiring user action' })
  requiringAction: CustomerAppointmentDto[];

  @ApiProperty({ type: [CustomerAppointmentDto], description: 'Events scheduled for today' })
  today: CustomerAppointmentDto[];

  @ApiProperty({ type: [CustomerAppointmentDto], description: 'Events scheduled for this week' })
  thisWeek: CustomerAppointmentDto[];

  @ApiProperty({ type: [CustomerAppointmentDto], description: 'Upcoming events beyond this week' })
  upcoming: CustomerAppointmentDto[];

  @ApiProperty({ type: [CustomerAppointmentDto], description: 'Past events (completed, canceled, etc.)' })
  history: CustomerAppointmentDto[];
}

export class GetCustomerAppointmentsViewResDto {
  @ApiProperty({ type: String, nullable: true, description: 'The ID of the most important upcoming event or action required' })
  heroAppointmentId: string | null;
  
  @ApiProperty({ type: GroupedAppointmentsDto, description: 'Events grouped by time and status' })
  appointments: GroupedAppointmentsDto;
} 