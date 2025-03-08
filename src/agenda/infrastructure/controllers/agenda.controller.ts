import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiHeader,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesFastifyInterceptor } from 'fastify-file-interceptor';

import { ArtistIdPipe } from '../../../artists/infrastructure/pipes/artistId.pipe';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { errorCodesToOASDescription } from '../../../global/infrastructure/helpers/errorCodesToOASDescription.helper';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import {
  AGENDA_EVENT_ID_PIPE_FAILED,
  AGENDA_EVENT_INVALID_ID_TYPE,
  AGENDA_EVENT_IS_ALREADY_DONE,
  AGENDA_EVENT_NOT_EXISTS,
  AGENDA_ID_PIPE_FAILED,
  AGENDA_INVALID_ID_TYPE,
  AGENDA_NOT_EXISTS,
} from '../../domain/errors/codes';
import { AgendaHandler } from '../agenda.handler';
import { AddEventReqDto } from '../dtos/addEventReq.dto';
import { ChangeEventStatusReqDto } from '../dtos/changeEventStatusReq.dto';
import { GetWorkEvidenceByArtistIdResponseDto } from '../dtos/getWorkEvidenceByArtistIdResponse.dto';
import { ListEventByViewTypeQueryDto } from '../dtos/listEventByViewTypeQuery.dto';
import { UpdateEventReqDto } from '../dtos/updateEventReq.dto';
import { AgendaEventIdPipe } from '../pipes/agendaEventId.pipe';
import { AgendaIdPipe } from '../pipes/agendaId.pipe';
import { ReviewArtistRequestDto } from '../../../reviews/dtos/reviewArtistRequest.dto';
import { SetWorkingHoursReqDto } from '../dtos/setWorkingHoursReq.dto';
import { CreateUnavailableTimeReqDto } from '../dtos/createUnavailableTimeReq.dto';
import { RescheduleEventReqDto } from '../dtos/rescheduleEventReq.dto';
import { UpdateEventNotesReqDto } from '../dtos/updateEventNotesReq.dto';
import { ArtistAvailabilityQueryDto } from '../dtos/artistAvailabilityQuery.dto';
import { UpdateAgendaSettingsReqDto } from '../dtos/updateAgendaSettingsReq.dto';
import { AgendaUnavailableTime } from '../entities/agendaUnavailableTime.entity';
import { AvailabilityCalendar, TimeSlot } from '../../services/scheduling.service';

@ApiTags('agenda')
@Controller('agenda')
@UseGuards(AuthGuard)
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

  @ApiOperation({
    summary: 'get all events from artist agenda or customer events',
  })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event list successful.', type: undefined })
  @ApiConflictResponse({ description: 'Trouble listing events.' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter events by status (scheduled, canceled, etc.)',
    type: String,
  })
  @Get()
  async listEventFromArtistAgenda(
    @Query('status') status?: string,
  ): Promise<any> {
    return this.agendaHandler.handleListEventFromArtistAgenda(status);
  }

  @ApiOperation({
    summary: 'get all events from artist id',
  })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event list successful.', type: undefined })
  @ApiConflictResponse({ description: 'Trouble listing events.' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @Get('/artist/:artistId')
  async listEventsByAgendaId(
    @Param('artistId', ParseIntPipe) artistId: number,
  ): Promise<any> {
    return this.agendaHandler.handleListEventsByAgendaId(artistId);
  }

  @ApiOperation({ summary: 'Get events by id' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Get Event successful.', type: undefined })
  @ApiConflictResponse({ description: 'Trouble finding event.' })
  @ApiParam({ name: 'eventId', required: true, type: Number })
  @Get('/event/:eventId')
  async getEventByEventId(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<any> {
    return this.agendaHandler.handleGetEventByEventId(eventId);
  }
  
  @ApiOperation({ summary: 'Get customer event by id' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Get Customer Event successful.', type: undefined })
  @ApiConflictResponse({ description: 'Trouble finding event.' })
  @ApiParam({ name: 'eventId', required: true, type: Number })
  @Get('/customer/event/:eventId')
  async getCustomerEventByEventId(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<any> {
    return this.agendaHandler.handleGetCustomerEventByEventId(eventId);
  }

  // TODO: VALIDATE IF THE ARTIST IS THE OWNER OF THE AGENDA, DO THIS WITH A GUARD OR VALIDATE THE TOKEN
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
  @UseInterceptors(FilesFastifyInterceptor('files[]', 10))
  async markEventAsDone(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    @UploadedFiles() workEvidenceFiles: FileInterface[],
  ): Promise<any> {
    console.log({ workEvidenceFiles });
    return this.agendaHandler.handleMarkEventAsDone(
      agendaId,
      eventId,
      workEvidenceFiles,
    );
  }

  @ApiOperation({ summary: 'Get work evidence by artistId' })
  @ApiOkResponse({
    description: 'Work evidence list successful.',
    type: GetWorkEvidenceByArtistIdResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Works not found.' })
  @ApiParam({ name: 'artistId', required: true, type: Number, example: 1 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 6 })
  @Get('artists/:artistId/work-evidence')
  async getWorkEvidenceByArtistId(
    @Param('artistId', ArtistIdPipe) artistId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit = 6,
  ): Promise<GetWorkEvidenceByArtistIdResponseDto> {
    return this.agendaHandler.handleGetWorkEvidenceByArtistId(
      artistId,
      page,
      limit,
    );
  }

  @ApiOperation({ summary: 'RSVP for an event' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'RSVP successful.', type: undefined })
  @ApiConflictResponse({ description: 'RSVP failed.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'eventId', required: true, type: Number, example: 1 })
  @ApiQuery({
    name: 'willAttend',
    required: true,
    type: Boolean,
    example: true,
  })
  @Post(':agendaId/event/:eventId/rsvp')
  async rsvp(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    @Query('willAttend', ParseBoolPipe) willAttend: boolean,
  ): Promise<any> {
    return this.agendaHandler.handleRsvp(agendaId, eventId, willAttend);
  }

  @ApiOperation({ summary: 'Change event status' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event status changed successfully.', type: undefined })
  @ApiConflictResponse({ description: 'Invalid status transition.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'eventId', required: true, type: Number, example: 1 })
  @Put(':agendaId/event/:eventId/status')
  async changeEventStatus(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    @Body() changeEventStatusReqDto: ChangeEventStatusReqDto,
  ): Promise<any> {
    return this.agendaHandler.handleChangeEventStatus(
      agendaId,
      eventId,
      changeEventStatusReqDto,
    );
  }

  @ApiOperation({ summary: 'Review an event' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event reviewed successfully.', type: undefined })
  @ApiConflictResponse({ description: 'Event not ready for review.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'eventId', required: true, type: Number, example: 1 })
  @Post(':agendaId/event/:eventId/review')
  async reviewEvent(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    @Body() reviewArtistReqDto: ReviewArtistRequestDto,
  ): Promise<any> {
    return this.agendaHandler.handleReviewEvent(
      agendaId,
      eventId,
      reviewArtistReqDto,
    );
  }

  // New endpoints for Artist Workflow Improvements

  @ApiOperation({ summary: 'Set working hours and days' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Working hours set successfully', type: undefined })
  @ApiConflictResponse({ description: 'Invalid working hours' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @Put(':agendaId/working-hours')
  async setWorkingHours(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Body() setWorkingHoursReqDto: SetWorkingHoursReqDto,
  ): Promise<void> {
    return this.agendaHandler.handleSetWorkingHours(agendaId, setWorkingHoursReqDto);
  }

  @ApiOperation({ summary: 'Create unavailable time block' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Unavailable time created successfully', type: AgendaUnavailableTime })
  @ApiConflictResponse({ description: 'Invalid time block' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @Post(':agendaId/unavailable-time')
  async createUnavailableTime(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Body() createUnavailableTimeReqDto: CreateUnavailableTimeReqDto,
  ): Promise<AgendaUnavailableTime> {
    return this.agendaHandler.handleCreateUnavailableTime(agendaId, createUnavailableTimeReqDto);
  }

  @ApiOperation({ summary: 'Get unavailable time blocks' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Unavailable times retrieved successfully', type: [AgendaUnavailableTime] })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @Get(':agendaId/unavailable-time')
  async getUnavailableTimes(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
  ): Promise<AgendaUnavailableTime[]> {
    return this.agendaHandler.handleGetUnavailableTimes(agendaId);
  }

  @ApiOperation({ summary: 'Delete unavailable time block' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Unavailable time deleted successfully' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'id', required: true, type: Number, example: 1 })
  @Delete(':agendaId/unavailable-time/:id')
  async deleteUnavailableTime(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.agendaHandler.handleDeleteUnavailableTime(agendaId, id);
  }

  @ApiOperation({ summary: 'Reschedule an event' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event rescheduled successfully' })
  @ApiConflictResponse({ description: 'Invalid reschedule request' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'eventId', required: true, type: Number, example: 1 })
  @Put(':agendaId/event/:eventId/reschedule')
  async rescheduleEvent(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    @Body() rescheduleEventReqDto: RescheduleEventReqDto,
  ): Promise<void> {
    return this.agendaHandler.handleRescheduleEvent(agendaId, eventId, rescheduleEventReqDto);
  }

  @ApiOperation({ summary: 'Update event notes' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event notes updated successfully' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'eventId', required: true, type: Number, example: 1 })
  @Put(':agendaId/event/:eventId/notes')
  async updateEventNotes(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Param('eventId', AgendaEventIdPipe) eventId: number,
    @Body() updateEventNotesReqDto: UpdateEventNotesReqDto,
  ): Promise<void> {
    return this.agendaHandler.handleUpdateEventNotes(agendaId, eventId, updateEventNotesReqDto);
  }

  @ApiOperation({ summary: 'Get artist availability' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Artist availability retrieved successfully' })
  @ApiParam({ name: 'artistId', required: true, type: Number, example: 1 })
  @Get('/artists/:artistId/availability')
  async getArtistAvailability(
    @Param('artistId', ParseIntPipe) artistId: number,
    @Query() query: ArtistAvailabilityQueryDto,
  ): Promise<AvailabilityCalendar[]> {
    return this.agendaHandler.handleGetArtistAvailability(artistId, query);
  }
  
  @ApiOperation({ summary: 'Update agenda visibility and open/closed status' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Agenda settings updated successfully' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @Put(':agendaId/settings')
  async updateAgendaSettings(
    @Param('agendaId', AgendaIdPipe) agendaId: number,
    @Body() updateAgendaSettingsReqDto: UpdateAgendaSettingsReqDto,
  ): Promise<void> {
    return this.agendaHandler.handleUpdateAgendaSettings(agendaId, updateAgendaSettingsReqDto);
  }
}
