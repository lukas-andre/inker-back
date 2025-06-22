import {
  Body,
  CacheKey,
  CacheTTL,
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

import { SendEventMessageReqDto } from 'src/agenda/infrastructure/dtos/sendEventMessageReq.dto';

import { ArtistIdPipe } from '../../../artists/infrastructure/pipes/artistId.pipe';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { errorCodesToOASDescription } from '../../../global/infrastructure/helpers/errorCodesToOASDescription.helper';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { ReviewArtistRequestDto } from '../../../reviews/dtos/reviewArtistRequest.dto';
import {
  AGENDA_EVENT_ID_PIPE_FAILED,
  AGENDA_EVENT_INVALID_ID_TYPE,
  AGENDA_EVENT_IS_ALREADY_DONE,
  AGENDA_EVENT_NOT_EXISTS,
  AGENDA_ID_PIPE_FAILED,
  AGENDA_INVALID_ID_TYPE,
  AGENDA_NOT_EXISTS,
} from '../../domain/errors/codes';
import {
  AvailabilityCalendar,
  SchedulingService,
  TimeSlot,
} from '../../services/scheduling.service';
import { AgendaHandler } from '../agenda.handler';
import { AddEventReqDto } from '../dtos/addEventReq.dto';
import { ArtistAvailabilityQueryDto } from '../dtos/artistAvailabilityQuery.dto';
import { CancelEventReqDto } from '../dtos/cancelEventReq.dto';
import { ChangeEventStatusReqDto } from '../dtos/changeEventStatusReq.dto';
import { CreateUnavailableTimeReqDto } from '../dtos/createUnavailableTimeReq.dto';
import { EventMessageDto } from '../dtos/eventMessage.dto';
import { GetAgendaSettingsResDto } from '../dtos/getAgendaSettingsRes.dto';
import { GetCustomerAppointmentsViewResDto } from '../dtos/getCustomerAppointmentsViewRes.dto';
import { GetSchedulerViewQueryDto } from '../dtos/getSchedulerViewQuery.dto';
import { GetWorkEvidenceByArtistIdResponseDto } from '../dtos/getWorkEvidenceByArtistIdResponse.dto';
import { ListEventByViewTypeQueryDto } from '../dtos/listEventByViewTypeQuery.dto';
import { UpdateEventReqDto } from '../dtos/updateEventReq.dto';
import { AgendaEventIdPipe } from '../pipes/agendaEventId.pipe';
import { AgendaIdPipe } from '../pipes/agendaId.pipe';
import { SetWorkingHoursReqDto } from '../dtos/setWorkingHoursReq.dto';
import { RescheduleEventReqDto } from '../dtos/rescheduleEventReq.dto';
import { UpdateEventNotesReqDto } from '../dtos/updateEventNotesReq.dto';
import { UpdateAgendaSettingsReqDto } from '../dtos/updateAgendaSettingsReq.dto';
import { AgendaUnavailableTime } from '../entities/agendaUnavailableTime.entity';
import { AgendaEvent } from '../entities/agendaEvent.entity';
import { GetSchedulerViewResDto } from '../dtos/getSchedulerViewRes.dto';
import { Agenda } from '../entities/agenda.entity';

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
    @Param('id') id: string,
    @Body() updateEventReqDto: UpdateEventReqDto,
  ): Promise<any> {
    return this.agendaHandler.handleUpdateEvent(updateEventReqDto, id);
  }

  @ApiOperation({ summary: 'Cancel event' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event canceled successful.', type: undefined })
  @ApiConflictResponse({
    description:
      'Invalid Dates. Event may not be cancellable in its current state or due to policies.',
  })
  @ApiParam({
    name: 'agendaId',
    required: true,
    type: String,
    description:
      'The ID of the agenda (UUID format). Note: This parameter may be deprecated or implicitly derived in future versions if cancellation primarily relies on eventId and authenticated user context.',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    type: String,
    description: 'The ID of the event to cancel (UUID format).',
  })
  @Delete(':agendaId/event/:eventId')
  async cancelEvent(
    @Param('agendaId') agendaId: string,
    @Param('eventId') eventId: string,
    @Body() cancelEventReqDto: CancelEventReqDto,
  ): Promise<any> {
    return this.agendaHandler.handleCancelEvent(
      eventId,
      agendaId,
      cancelEventReqDto.reason,
    );
  }

  @ApiOperation({ summary: 'List events for week/day' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event list successful.', type: undefined })
  @ApiConflictResponse({ description: 'Trouble listing events.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number })
  @Get(':agendaId')
  async listEventByViewType(
    @Param('agendaId') agendaId: string,
    @Query() listEventByViewTypeQueryDto: ListEventByViewTypeQueryDto,
  ): Promise<any> {
    return this.agendaHandler.handleListEventByViewType(
      agendaId,
      listEventByViewTypeQueryDto,
    );
  }

  @ApiOperation({
    summary: 'get all events from artist agenda or customer events',
    description:
      'For customers, returns a structured view of appointments (hero, grouped by time). For artists, returns a simple list.',
  })
  @HttpCode(200)
  @ApiOkResponse({
    description:
      'Event list successful. The response structure depends on the user type.',
    type: GetCustomerAppointmentsViewResDto, // DTO for the customer view
  })
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
    // The return type can be either GetCustomerAppointmentsViewResDto or AgendaEvent[]
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
    @Param('artistId') artistId: string,
  ): Promise<any> {
    return this.agendaHandler.handleListEventsByAgendaId(artistId);
  }

  @ApiOperation({ summary: 'Get events by id' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Get Event successful.', type: undefined })
  @ApiConflictResponse({ description: 'Trouble finding event.' })
  @ApiParam({ name: 'eventId', required: true, type: Number })
  @CacheTTL(20) // Cache for 20 seconds
  @Get('/event/:eventId')
  async getEventByEventId(@Param('eventId') eventId: string): Promise<any> {
    return this.agendaHandler.handleGetEventByEventId(eventId);
  }

  @ApiOperation({ summary: 'Get customer event by id' })
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Get Customer Event successful.',
    type: undefined,
  })
  @ApiConflictResponse({ description: 'Trouble finding event.' })
  @ApiParam({ name: 'eventId', required: true, type: Number })
  @Get('/customer/event/:eventId')
  async getCustomerEventByEventId(
    @Param('eventId') eventId: string,
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
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
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
    @Param('artistId', ArtistIdPipe) artistId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit = 6,
  ): Promise<GetWorkEvidenceByArtistIdResponseDto> {
    return this.agendaHandler.handleGetWorkEvidenceByArtistId(
      artistId,
      page,
      limit,
    );
  }

  @ApiOperation({
    summary: 'RSVP to an event (Deprecated)',
    description:
      'Use POST /:agendaId/events/:eventId/confirm or POST /:agendaId/events/:eventId/reject instead.',
  })
  @ApiOkResponse({ description: 'RSVP processed.', type: DefaultResponseDto })
  @ApiParam({ name: 'agendaId', required: true, description: 'Agenda ID' })
  @ApiParam({ name: 'eventId', required: true, description: 'Event ID' })
  @ApiQuery({
    name: 'willAttend',
    required: true,
    type: Boolean,
    description: 'True to accept, false to decline',
  })
  @Put(':agendaId/event/:eventId/rsvp')
  async rsvp(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
    @Query('willAttend', ParseBoolPipe) willAttend: boolean,
  ): Promise<DefaultResponseDto> {
    this.logger.warn(
      `Deprecated RSVP endpoint was called for event ${eventId}`,
    );
    return this.agendaHandler.handleRsvp(agendaId, eventId, willAttend);
  }

  @ApiOperation({ summary: 'Change event status' })
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Event status changed successfully.',
    type: undefined,
  })
  @ApiConflictResponse({ description: 'Invalid status transition.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'eventId', required: true, type: Number, example: 1 })
  @Put(':agendaId/event/:eventId/status')
  async changeEventStatus(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
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
  @ApiOkResponse({
    description: 'Event reviewed successfully.',
    type: undefined,
  })
  @ApiConflictResponse({ description: 'Event not ready for review.' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'eventId', required: true, type: Number, example: 1 })
  @Post(':agendaId/event/:eventId/review')
  async reviewEvent(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
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
  @ApiOkResponse({
    description: 'Working hours set successfully',
    type: undefined,
  })
  @ApiConflictResponse({ description: 'Invalid working hours' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @Put(':agendaId/working-hours')
  async setWorkingHours(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Body() setWorkingHoursReqDto: SetWorkingHoursReqDto,
  ): Promise<void> {
    return this.agendaHandler.handleSetWorkingHours(
      agendaId,
      setWorkingHoursReqDto,
    );
  }

  @ApiOperation({ summary: 'Create unavailable time block' })
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Unavailable time created successfully',
    type: AgendaUnavailableTime,
  })
  @ApiConflictResponse({ description: 'Invalid time block' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @Post(':agendaId/unavailable-time')
  async createUnavailableTime(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Body() createUnavailableTimeReqDto: CreateUnavailableTimeReqDto,
  ): Promise<AgendaUnavailableTime> {
    return this.agendaHandler.handleCreateUnavailableTime(
      agendaId,
      createUnavailableTimeReqDto,
    );
  }

  @ApiOperation({ summary: 'Get unavailable time blocks' })
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Unavailable times retrieved successfully',
    type: [AgendaUnavailableTime],
  })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @Get(':agendaId/unavailable-time')
  async getUnavailableTimes(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
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
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('id') id: string,
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
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
    @Body() rescheduleEventReqDto: RescheduleEventReqDto,
  ): Promise<void> {
    return this.agendaHandler.handleRescheduleEvent(
      agendaId,
      eventId,
      rescheduleEventReqDto,
    );
  }

  @ApiOperation({ summary: 'Update event notes' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Event notes updated successfully' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @ApiParam({ name: 'eventId', required: true, type: Number, example: 1 })
  @Put(':agendaId/event/:eventId/notes')
  async updateEventNotes(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
    @Body() updateEventNotesReqDto: UpdateEventNotesReqDto,
  ): Promise<void> {
    return this.agendaHandler.handleUpdateEventNotes(
      agendaId,
      eventId,
      updateEventNotesReqDto,
    );
  }

  @ApiOperation({ summary: 'Get artist availability' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Artist availability retrieved successfully' })
  @ApiParam({ name: 'artistId', required: true, type: Number, example: 1 })
  @Get('/artists/:artistId/availability')
  @CacheTTL(20) // Cache for 20 seconds
  async getArtistAvailability(
    @Param('artistId') artistId: string,
    @Query() query: ArtistAvailabilityQueryDto,
  ): Promise<AvailabilityCalendar[]> {
    return this.agendaHandler.handleGetArtistAvailability(artistId, query);
  }

  @ApiOperation({ summary: 'Get artist available time slots' })
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Artist available time slots retrieved successfully',
  })
  @ApiParam({ name: 'artistId', required: true, type: Number, example: 1 })
  @Get('/artists/:artistId/available-slots')
  async getArtistAvailableSlots(
    @Param('artistId') artistId: string,
    @Query('date') date: string,
    @Query('duration', new DefaultValuePipe(60), ParseIntPipe) duration = 60,
    @Query('suggestionsCount', new DefaultValuePipe(8), ParseIntPipe)
    suggestionsCount = 8,
  ): Promise<TimeSlot[]> {
    // Use the scheduling service directly for better suggestions
    const schedulingService = this.agendaHandler[
      'schedulingService'
    ] as SchedulingService;

    if (schedulingService) {
      // Get optimal time slots in the next 7 days
      return schedulingService.suggestOptimalTimes(
        artistId,
        duration,
        suggestionsCount,
      );
    } else {
      // Fallback logic if the scheduling service isn't accessible
      // Uses date if provided, otherwise looks for slots starting today
      const fromDate = date ? new Date(date) : new Date();
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 7); // Look ahead 7 days

      const availabilityCalendar =
        await this.agendaHandler.handleGetArtistAvailability(artistId, {
          fromDate: fromDate,
          toDate: toDate,
          duration,
        });

      // Flatten all slots from all days into a single array
      let allSlots: TimeSlot[] = [];
      for (const day of availabilityCalendar) {
        allSlots = [...allSlots, ...day.slots];
      }

      // Sort by date (earlier slots first)
      allSlots.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

      // Return the first 'suggestionsCount' slots or all if less than that
      return allSlots.slice(0, suggestionsCount);
    }
  }

  @ApiOperation({
    summary: 'Get agenda settings including working hours and visibility',
  })
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Agenda settings retrieved successfully',
    type: GetAgendaSettingsResDto,
  })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @Get(':agendaId/settings')
  @CacheTTL(20) // Cache for 20 seconds
  async getAgendaSettings(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
  ): Promise<GetAgendaSettingsResDto> {
    return this.agendaHandler.handleGetAgendaSettings(agendaId);
  }

  // GET AGENDA FROM ARTIST ID 
  @ApiOperation({ summary: 'Get agenda from artist id' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Agenda retrieved successfully' })
  @ApiParam({ name: 'artistId', required: true, type: Number, example: 1 })
  @Get('artists/:artistId/agenda')
  async getAgendaFromArtistId(@Param('artistId') artistId: string): Promise<Agenda> {
    return this.agendaHandler.handleGetAgendaFromArtistId(artistId);
  }

  @ApiOperation({ summary: 'Update agenda visibility and open/closed status' })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Agenda settings updated successfully' })
  @ApiParam({ name: 'agendaId', required: true, type: Number, example: 1 })
  @Put(':agendaId/settings')
  async updateAgendaSettings(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Body() updateAgendaSettingsReqDto: UpdateAgendaSettingsReqDto,
  ): Promise<void> {
    return this.agendaHandler.handleUpdateAgendaSettings(
      agendaId,
      updateAgendaSettingsReqDto,
    );
  }

  @ApiOperation({ summary: 'Confirm an event invitation' })
  @ApiOkResponse({
    description: 'Event confirmed successfully.',
    type: DefaultResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Event or Agenda not found.' })
  @ApiBadRequestResponse({
    description: 'User not authorized or invalid event state for confirmation.',
  })
  @ApiParam({
    name: 'agendaId',
    required: true,
    description: 'Agenda ID containing the event',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Event ID to confirm',
  })
  @Post(':agendaId/events/:eventId/confirm')
  @HttpCode(200)
  async confirmEvent(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
  ): Promise<DefaultResponseDto> {
    return this.agendaHandler.handleRsvp(agendaId, eventId, true);
  }

  @ApiOperation({ summary: 'Reject an event invitation' })
  @ApiOkResponse({
    description: 'Event rejected successfully.',
    type: DefaultResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Event or Agenda not found.' })
  @ApiBadRequestResponse({
    description: 'User not authorized or invalid event state for rejection.',
  })
  @ApiParam({
    name: 'agendaId',
    required: true,
    description: 'Agenda ID containing the event',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Event ID to reject',
  })
  @Post(':agendaId/events/:eventId/reject')
  @HttpCode(200)
  async rejectEvent(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
  ): Promise<DefaultResponseDto> {
    return this.agendaHandler.handleRsvp(agendaId, eventId, false);
  }

  @ApiOperation({ summary: 'Send a message to an event chat' })
  @ApiOkResponse({
    description: 'Message sent successfully.',
    type: DefaultResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Event or Agenda not found.' })
  @ApiBadRequestResponse({
    description:
      'User not authorized or invalid event state for sending messages.',
  })
  @ApiParam({
    name: 'agendaId',
    required: true,
    description: 'Agenda ID containing the event',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Event ID to send message to',
  })
  @Post(':agendaId/event/:eventId/message')
  @UseInterceptors(FilesFastifyInterceptor('imageFile', 1))
  @HttpCode(200)
  async sendEventMessage(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
    @Body() sendEventMessageReqDto: SendEventMessageReqDto,
    @UploadedFiles() imageFile?: FileInterface[],
  ): Promise<any> {
    const file = imageFile && imageFile.length > 0 ? imageFile[0] : undefined;
    return this.agendaHandler.handleSendEventMessage(
      agendaId,
      eventId,
      sendEventMessageReqDto,
      file,
    );
  }

  @ApiOperation({ summary: 'Get messages for an event chat' })
  @ApiOkResponse({
    description: 'Messages retrieved successfully.',
    type: [EventMessageDto],
  })
  @ApiNotFoundResponse({ description: 'Event or Agenda not found.' })
  @ApiBadRequestResponse({
    description: 'User not authorized to view messages.',
  })
  @ApiParam({
    name: 'agendaId',
    required: true,
    description: 'Agenda ID containing the event',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Event ID to retrieve messages from',
  })
  @Get(':agendaId/event/:eventId/messages')
  @HttpCode(200)
  async getEventMessages(
    @Param('agendaId', AgendaIdPipe) agendaId: string,
    @Param('eventId', AgendaEventIdPipe) eventId: string,
  ): Promise<EventMessageDto[]> {
    return this.agendaHandler.handleGetEventMessages(agendaId, eventId);
  }

  @ApiOperation({ summary: 'Add work evidence to an event' })
  @ApiOkResponse({
    description: 'Work evidence added successfully.',
    type: AgendaEvent,
  })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  @ApiBadRequestResponse({
    description: 'User not authorized or invalid event state.',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Event ID to add work evidence to',
  })
  @Post('event/:eventId/work-evidence')
  @UseInterceptors(FilesFastifyInterceptor('files', 10))
  @HttpCode(200)
  async addWorkEvidence(
    @Param('eventId', AgendaEventIdPipe) eventId: string,
    @UploadedFiles() files: FileInterface[],
  ): Promise<AgendaEvent> {
    return this.agendaHandler.handleAddWorkEvidence(eventId, files);
  }

  @ApiOperation({ summary: 'Delete work evidence from an event' })
  @ApiOkResponse({
    description: 'Work evidence deleted successfully.',
    type: AgendaEvent,
  })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  @ApiBadRequestResponse({
    description:
      'User not authorized or work evidence cannot be deleted in the current event state.',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Event ID to delete work evidence from',
  })
  @Delete('event/:eventId/work-evidence')
  @HttpCode(200)
  async deleteWorkEvidence(
    @Param('eventId', AgendaEventIdPipe) eventId: string,
  ): Promise<AgendaEvent> {
    return this.agendaHandler.handleDeleteWorkEvidence(eventId);
  }

  @ApiOperation({
    summary: 'Get combined scheduler view with events and quotations',
    description:
      'Returns all events and quotations for an artist within a date range, optimized for scheduler UI',
  })
  @ApiOkResponse({
    description: 'Scheduler data retrieved successfully',
    type: GetSchedulerViewResDto,
  })
  @ApiParam({ name: 'artistId', required: true, type: String })
  @Get('schedule/:artistId')
  @CacheTTL(10)
  async getSchedulerView(
    @Param('artistId') artistId: string,
    @Query() query: GetSchedulerViewQueryDto,
  ): Promise<GetSchedulerViewResDto> {
    return this.agendaHandler.handleGetSchedulerView(artistId, query);
  }
}
