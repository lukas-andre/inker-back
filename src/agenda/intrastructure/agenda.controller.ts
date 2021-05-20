import {
  Controller,
  HttpCode,
  Post,
  Body,
  Logger,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AgendaHandler } from './agenda.handler';
import { AddEventReqDto } from './dtos/addEventReq.dto';
import { UpdateEventReqDto } from './dtos/updateEventReq.dto';

@ApiTags('agenda')
@Controller('agenda')
export class AgendaController {
  private readonly serviceName = AgendaController.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(private readonly agendaHandler: AgendaHandler) {}

  @ApiOperation({ summary: 'Add event' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event added successful.', type: undefined })
  @ApiConflictResponse({ description: 'Invalid Dates.' })
  @Post('event')
  async addEvent(@Body() addEventReqDto: AddEventReqDto): Promise<any> {
    return this.agendaHandler.handleAddEvent(addEventReqDto);
  }

  @ApiOperation({ summary: 'Update event' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event updated successful.', type: undefined })
  @ApiConflictResponse({ description: 'Invalid Dates.' })
  @Put('event/:id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventReqDto: UpdateEventReqDto,
  ): Promise<any> {
    return this.agendaHandler.handleUpdateEvent(updateEventReqDto, id);
  }

  @ApiOperation({ summary: 'Cancel event' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event canceled successful.', type: undefined })
  @ApiConflictResponse({ description: 'Invalid Dates.' })
  @Delete('agendaId/event/:eventId')
  async cancelEvent(
    @Param('eventId') eventId: string,
    @Param('agendaId') agendaId: string,
  ): Promise<any> {
    return this.agendaHandler.handleCancelEvent(eventId, agendaId);
  }

  // TODO: HACER UN CONTROLADO ESPECIFICO PARAEVENTOS,
  // TODO: HACER UN SOLO ENDPOINT PARA MOSTRAR Y PAGINAR EVENTOS POR SEMANA Y EVENTOS POR DIA
  // TODO: REAGENDAMIENTO ? 
}
