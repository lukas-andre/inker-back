import { ApiProperty } from '@nestjs/swagger';

export class AppointmentContextualInfo {
  @ApiProperty({
    description:
      'A human-readable title that summarizes the state of the appointment.',
    example: 'Confirmación Requerida',
  })
  title: string;

  @ApiProperty({
    description: 'A friendly and descriptive message for the user.',
    example:
      'El artista está esperando que confirmes tu cita. ¡Hazlo antes de que expire!',
  })
  message: string;

  @ApiProperty({
    description:
      'An optional, helpful tip for the customer related to their upcoming appointment.',
    example: 'Recuerda llevar tu identificación oficial y mantenerte hidratado.',
    nullable: true,
  })
  tip?: string;
} 