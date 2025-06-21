import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bull';

import {
  DomainBadRule,
  DomainConflict,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import {
  PROCESS_PENALTY_V1,
  ProcessPenaltyV1Job,
} from '../../../queues/penalty/domain/schemas/penaltyJob.schema';
import { queues } from '../../../queues/queues';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { AgendaEventStatus } from '../../domain/enum';
import { AgendaEventTransition } from '../../domain/services/eventStateMachine.service';
import {
  CalculatedPenalty,
  PenaltyCalculationService,
} from '../../domain/services/penaltyCalculation.service';
import {
  CancellationPenalty,
  PenaltyUserRole,
} from '../../infrastructure/entities/cancellationPenalty.entity';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { CancellationPenaltyRepository } from '../../infrastructure/repositories/cancellationPenalty.repository';

import { ChangeEventStatusUsecase } from './changeEventStatus.usecase';

export interface CancelEventAndApplyPenaltyCommand {
  eventId: string;
  cancellingUserId: string;
  cancellingUserType: UserType;
  reason: string;
}

@Injectable()
export class CancelEventAndApplyPenaltyUseCase
  extends BaseUseCase
  implements UseCase
{
  protected readonly logger = new Logger(
    CancelEventAndApplyPenaltyUseCase.name,
  );

  constructor(
    private readonly agendaEventRepo: AgendaEventRepository,
    private readonly cancellationPenaltyRepo: CancellationPenaltyRepository,
    private readonly penaltyCalculationService: PenaltyCalculationService,
    private readonly changeEventStatusUsecase: ChangeEventStatusUsecase,
    @InjectQueue(queues.penaltyProcessing.name)
    private readonly penaltyProcessingQueue: Queue,
  ) {
    super(CancelEventAndApplyPenaltyUseCase.name);
  }

  async execute(
    eventId: string,
    cancelerId: string,
    cancelerType: UserType,
    reason: string,
    notes?: string,
  ): Promise<{ eventId: string; penaltyApplied: boolean; penaltyId?: string }> {
    this.logger.log(
      `Attempting to cancel event ${eventId} by ${cancelerType} ${cancelerId} due to ${reason}`,
    );

    const event = await this.agendaEventRepo.findOne({
      where: { id: eventId },
      relations: ['agenda'],
    });

    if (!event) {
      throw new DomainNotFound('Event not found');
    }

    if (event.status === AgendaEventStatus.CANCELED) {
      throw new DomainConflict('Event is already canceled');
    }

    const eventArtistId = event.agenda?.artistId;
    if (
      (cancelerType === UserType.ARTIST && eventArtistId !== cancelerId) ||
      (cancelerType === UserType.CUSTOMER && event.customerId !== cancelerId)
    ) {
      throw new DomainBadRule('User not authorized to cancel this event');
    }

    const calculatedPenalty: CalculatedPenalty | null =
      await this.penaltyCalculationService.calculateForUser(
        event,
        cancelerType as PenaltyUserRole,
      );

    let penaltyApplied = false;
    let savedPenalty: CancellationPenalty | null = null;

    if (calculatedPenalty) {
      const userIdToPenalize =
        calculatedPenalty.metadata.userRole === UserType.ARTIST
          ? eventArtistId
          : event.customerId;
      if (!userIdToPenalize) {
        this.logger.error(
          `Could not determine userIdToPenalize for event ${eventId}. Role: ${calculatedPenalty.metadata.userRole}`,
        );
        throw new DomainBadRule('Error determining user to penalize.');
      }

      const penaltyEntity = this.cancellationPenaltyRepo.create({
        eventId: event.id,
        userId: userIdToPenalize,
        agendaId: event.agenda?.id,
        quotationId: event.quotationId,
        type: calculatedPenalty.type,
        amount: calculatedPenalty.amount,
        reputationPoints: calculatedPenalty.reputationPoints,
        status: calculatedPenalty.status,
        metadata: {
          ...calculatedPenalty.metadata,
          cancellationInitiatorId: cancelerId,
          reason: reason,
        },
      });

      savedPenalty = await this.cancellationPenaltyRepo.save(penaltyEntity);
      penaltyApplied = true;
      this.logger.log(
        `Penalty rule applied for event ${eventId}. Penalty ID: ${savedPenalty.id}`,
      );

      const penaltyJobData: ProcessPenaltyV1Job = {
        jobId: PROCESS_PENALTY_V1,
        penalty: savedPenalty,
      };

      try {
        await this.penaltyProcessingQueue.add(
          PROCESS_PENALTY_V1,
          penaltyJobData,
        );
        this.logger.log(
          `Job ${PROCESS_PENALTY_V1} for penalty ${savedPenalty.id} added to ${queues.penaltyProcessing.name} queue.`,
        );
      } catch (queueError) {
        this.logger.error(
          `Failed to add job ${PROCESS_PENALTY_V1} for penalty ${
            savedPenalty.id
          } to queue: ${(queueError as Error).message}`,
          (queueError as Error).stack,
        );
      }
    } else {
      this.logger.log(
        `No penalty rule applied for event ${eventId} cancellation.`,
      );
    }

    await this.changeEventStatusUsecase.execute(event.agenda.id, event.id, {
      reason: reason,
      notes: notes,
      eventAction: AgendaEventTransition.CANCEL,
    });

    this.logger.log(
      `Event ${eventId} successfully canceled. Penalty applied: ${penaltyApplied}.`,
    );

    return {
      eventId: event.id,
      penaltyApplied,
      penaltyId: savedPenalty?.id,
    };
  }
}
