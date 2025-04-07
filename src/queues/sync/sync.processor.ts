import { Processor, InjectQueue, Process } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { BaseComponent } from '../../global/domain/components/base.component';
import { queues } from '../queues';
import {
  CreateAgendaEventJobType,
  SyncArtistRatingsJobType,
  SyncJobIdSchema,
  SyncJobType,
} from './jobs';
import { ArtistProvider } from '../../artists/infrastructure/database/artist.provider';
import { ReviewAvgProvider } from '../../reviews/database/providers/reviewAvg.provider';
import { AgendaProvider } from '../../agenda/infrastructure/providers/agenda.provider';
import { QuotationProvider } from '../../agenda/infrastructure/providers/quotation.provider';
import { CreateAgendaEventService } from '../../agenda/usecases/common/createAgendaEvent.service';

@Processor(queues.sync.name)
export class SyncProcessor extends BaseComponent {
  constructor(
    @InjectQueue(queues.deadLetter.name)
    private readonly deadLetterQueue: Queue,
    private readonly artistProvider: ArtistProvider,
    private readonly reviewAvgProvider: ReviewAvgProvider,
    private readonly agendaProvider: AgendaProvider,
    private readonly quotationProvider: QuotationProvider,
    private readonly createAgendaEventService: CreateAgendaEventService,
  ) {
    super(SyncProcessor.name);
    this.logger.log('Sync processor initialized');
  }

  @Process()
  async process(job: Job<SyncJobType>): Promise<void> {
    if (this.shouldMoveToDeadLetter(job)) {
      await this.moveToDeadLetter(job);
      return;
    }

    switch (job.data.jobId) {
      case SyncJobIdSchema.enum.SYNC_ARTIST_RATINGS:
        await this.syncArtistRating(job.data as SyncArtistRatingsJobType);
        break;
      case SyncJobIdSchema.enum.CREATE_AGENDA_EVENT:
        await this.createAgendaEvent(job.data as CreateAgendaEventJobType);
        break;
    }

    this.logger.log(`Sync job ${job.id} processed successfully`);
  }

  private async createAgendaEvent(
    data: CreateAgendaEventJobType,
  ): Promise<void> {
    const agenda = await this.agendaProvider.findOne({
      where: {
        artistId: data.metadata.artistId,
      },
    });
    if (!agenda) {
      this.logger.error(`Agenda not found for id ${data.metadata.artistId}`);
      return;
    }

    const quotation = await this.quotationProvider.findById(
      data.metadata.quotationId,
    );
    if (!quotation) {
      this.logger.error(
        `Quotation not found for id ${data.metadata.quotationId}`,
      );
      return;
    }

    // Validate quotation status and required fields
    if (quotation.status !== 'accepted') {
      this.logger.error(
        `Cannot create agenda event for non-accepted quotation ${quotation.id}`,
      );
      return;
    }

    if (!quotation.appointmentDate || !quotation.appointmentDuration) {
      this.logger.error(
        `Quotation ${quotation.id} missing appointment details`,
      );
      return;
    }

    // Check for existing event to prevent duplicates (do this before using the service)
    const existingEvent = await this.agendaProvider.source.query(
      `SELECT id FROM agenda_event WHERE quotation_id = $1`,
      [quotation.id],
    );

    if (existingEvent?.length) {
      this.logger.warn(
        `Agenda event already exists for quotation ${quotation.id}`,
      );
      return;
    }

    // Calculate end date based on appointment duration
    const endDate = new Date(
      quotation.appointmentDate.getTime() +
        quotation.appointmentDuration * 60 * 1000,
    );

    // Use our common event creation service to create the event with history
    const result = await this.createAgendaEventService.createEventFromQuotation(
      agenda.id,
      quotation.id,
      quotation.customerId,
      'Appointment from Quotation', // Title
      quotation.description || 'Appointment details', // Info
      '#000000', // Color
      quotation.appointmentDate,
      endDate,
      quotation.lastUpdatedBy, // Using whoever last updated the quotation as the creator
    );

    if (!result.transactionIsOK) {
      this.logger.error(`Failed to create agenda event for quotation ${quotation.id}`);
      return;
    }

    this.logger.log(`Created agenda event (ID: ${result.eventId}) for quotation ${quotation.id}`);
  }

  private async syncArtistRating(
    data: SyncArtistRatingsJobType,
  ): Promise<void> {
    const reviewAvg = await this.reviewAvgProvider.findByArtistId(
      data.metadata.artistId,
    );
    if (!reviewAvg) {
      this.logger.error(
        `Review avg not found for artist ${data.metadata.artistId}`,
      );
      return;
    }
    const queryRunner = this.artistProvider.source.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.query(
        `UPDATE artist SET rating = ROUND(CAST($1 AS numeric), 1) WHERE id = $2`,
        [reviewAvg.value, data.metadata.artistId],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private shouldMoveToDeadLetter(job: Job<SyncJobType>): boolean {
    return job.attemptsMade > queues.sync.attempts;
  }

  private async moveToDeadLetter(job: Job<SyncJobType>): Promise<void> {
    await this.deadLetterQueue.add(queues.deadLetter.name, job.data);
    this.logger.warn(
      `Job ${job.id} moved to dead letter queue after ${job.attemptsMade} attempts`,
    );
  }
}
