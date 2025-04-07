import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ValidateDateFormat } from '../../../global/domain/validators/isOnlyDate.validator';
import { AgendaViewType } from '../../domain/enum/agendaViewType.enum';

export class ListEventByViewTypeQueryDto {
  @ApiProperty({
    example: AgendaViewType.WEEK,
    enum: [AgendaViewType.WEEK, AgendaViewType.DAY, AgendaViewType.MONTH],
    description: 'Agenda View Type',
  })
  @IsEnum(AgendaViewType)
  readonly agendaViewType: AgendaViewType;

  @ApiProperty({
    example: '2021-05-18 16:00:00',
    description: 'Start date string(format:YYYY-MM-DD hh:mm:ss)',
  })
  @ValidateDateFormat('YYYY-MM-DD')
  readonly date: string;

  //TODO: AGREGAR MAS FILTROS XD, PODRIA SER POR CUSTOMER ID POR MAÑANA/TARDE/NOCHE
}
