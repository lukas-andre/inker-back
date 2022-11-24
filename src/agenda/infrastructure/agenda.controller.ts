import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { DefaultResponseDto } from '../../global/infrastructure/dtos/defaultResponse.dto';
import { errorCodesToOASDescription } from '../../global/infrastructure/helpers/errorCodesToOASDescription.helper';
import {
  AGENDA_EVENT_ID_PIPE_FAILED,
  AGENDA_EVENT_INVALID_ID_TYPE,
  AGENDA_EVENT_IS_ALREADY_DONE,
  AGENDA_EVENT_NOT_EXISTS,
  AGENDA_ID_PIPE_FAILED,
  AGENDA_INVALID_ID_TYPE,
  AGENDA_NOT_EXISTS,
} from '../domain/errors/codes';

import { AgendaHandler } from './agenda.handler';
import { AddEventReqDto } from './dtos/addEventReq.dto';
import { ListEventByViewTypeQueryDto } from './dtos/listEventByViewTypeQuery.dto';
import { UpdateEventReqDto } from './dtos/updateEventReq.dto';
import { AgendaEventIdPipe } from './pipes/agendaEventId.pipe';
import { AgendaIdPipe } from './pipes/agendaId.pipe';

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
  @ApiParam({ name: 'id', required: true, type: Number })
  @Put('event/:id')
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventReqDto: UpdateEventReqDto,
  ): Promise<any> {
    return this.agendaHandler.handleUpdateEvent(updateEventReqDto, id);
  }

  @ApiOperation({ summary: 'Cancel event' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event canceled successful.', type: undefined })
  @ApiConflictResponse({ description: 'Invalid Dates.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number })
  @ApiParam({ name: 'eventId', required: true, type: Number })
  @Delete(':agendaId/event/:eventId')
  async cancelEvent(
    @Param('agendaId', ParseIntPipe) agendaId: number,
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<any> {
    return this.agendaHandler.handleCancelEvent(eventId, agendaId);
  }

  @ApiOperation({ summary: 'List events for week/day' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event list successful.', type: undefined })
  @ApiConflictResponse({ description: 'Trouble listing events.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number })
  @Get(':agendaId')
  async listEventByViewType(
    @Param('agendaId', ParseIntPipe) agendaId: number,
    @Query() listEventByViewTypeQueryDto: ListEventByViewTypeQueryDto,
  ): Promise<any> {
    return this.agendaHandler.handleListEventByViewType(
      agendaId,
      listEventByViewTypeQueryDto,
    );
  }

  @ApiOperation({ summary: 'Get events by id' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Get Event successful.', type: undefined })
  @ApiConflictResponse({ description: 'Trouble finding event.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number })
  @ApiParam({ name: 'eventId', required: true, type: Number })
  @Get(':agendaId/event/:eventId')
  async getEventByEventId(
    @Param('agendaId', ParseIntPipe) agendaId: number,
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<any> {
    return this.agendaHandler.handleGetEventByEventId(agendaId, eventId);
  }

  @ApiOperation({ summary: 'Mark event as done' })
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Event marked as done successful.',
    type: DefaultResponseDto,
  })
  @ApiConflictResponse({ description: 'Trouble marking event as done.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'eventId', required: true, type: Number, example: 1 })
  @ApiBadRequestResponse({
    description: errorCodesToOASDescription([
      AGENDA_ID_PIPE_FAILED,
      AGENDA_INVALID_ID_TYPE,
      AGENDA_EVENT_ID_PIPE_FAILED,
      AGENDA_EVENT_INVALID_ID_TYPE,
    ]),
  })
  @ApiNotFoundResponse({
    description: errorCodesToOASDescription([
      AGENDA_EVENT_NOT_EXISTS,
      AGENDA_NOT_EXISTS,
    ]),
  })
  @ApiNotAcceptableResponse({
    description: AGENDA_EVENT_IS_ALREADY_DONE,
  })
  @Put(':agendaId/event/:eventId/done')
  async markEventAsDone(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Param('eventId', AgendaEventIdPipe) eventId: number,
  ): Promise<any> {
    return this.agendaHandler.handleMarkEventAsDone(agendaId, eventId);
  }

  // TODO: HACER UN CONTROLADO ESPECIFICO PARAEVENTOS,
  // TODO: GET EVENT BY ID
  // TODO: REAGENDAMIENTO ?
}
