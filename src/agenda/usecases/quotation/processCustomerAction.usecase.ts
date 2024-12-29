import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import {
  DomainBadRule,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { queues } from '../../../queues/queues';
import { QuotationStateMachine } from '../../domain/quotation.statemachine';
import {
  CustomerQuotationAction,
  CustomerQuotationActionDto,
} from '../../infrastructure/dtos/customerQuotationAction.dto';
import { QuotationStatus } from '../../infrastructure/entities/quotation.entity';
import { QuotationProvider } from '../../infrastructure/providers/quotation.provider';
import {
  QuotationCustomerActionJobIdType,
  QuotationCustomerActionJobType,
  QuotationJobIdType,
} from '../../../queues/notifications/domain/schemas/quotation';
import { CreateAgendaEventJobType } from '../../../queues/sync/jobs';

@Injectable()
export class ProcessCustomerActionUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly quotationProvider: QuotationProvider,
    private readonly quotationStateMachine: QuotationStateMachine,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
    @InjectQueue(queues.sync.name)
    private readonly syncQueue: Queue,
  ) {
    super(ProcessCustomerActionUseCase.name);
  }

  async execute(
    userId: number,
    quotationId: number,
    customerActionDto: CustomerQuotationActionDto,
  ): Promise<{ message: string; updated: boolean }> {
    const quotation = await this.quotationProvider.findById(quotationId);

    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }

    let newStatus: QuotationStatus;
    try {
      switch (customerActionDto.action) {
        case CustomerQuotationAction.ACCEPT:
          newStatus = this.quotationStateMachine.transition(
            quotation,
            'accepted',
          );
          break;
        case CustomerQuotationAction.REJECT:
          newStatus = this.quotationStateMachine.transition(
            quotation,
            'rejected',
          );
          break;
        case CustomerQuotationAction.APPEAL:
          newStatus = this.quotationStateMachine.transition(
            quotation,
            'appealed',
          );
          break;
        case CustomerQuotationAction.CANCEL:
          newStatus = this.quotationStateMachine.transition(
            quotation,
            'canceled',
          );
          break;
        default:
          throw new DomainBadRule('Invalid action');
      }
    } catch (error) {
      throw new DomainBadRule((error as Error).message);
    }

    const { transactionIsOK, updatedQuotation } =
      await this.quotationProvider.updateQuotationState(
        quotationId,
        userId,
        'customer',
        {
          action: customerActionDto.action,
          rejectionReason: customerActionDto.rejectionReason,
          appealReason: customerActionDto.appealReason,
          additionalDetails: customerActionDto.additionalDetails,
          // cancelReason: customerActionDto.cancelReason,
        },
        newStatus,
      );
    if (!transactionIsOK || !updatedQuotation) {
      throw new DomainBadRule('Error updating quotation');
    }

    let notificationTypeId: QuotationCustomerActionJobIdType;

    switch (customerActionDto.action) {
      case CustomerQuotationAction.ACCEPT:
        notificationTypeId = 'QUOTATION_ACCEPTED';
        break;
      case CustomerQuotationAction.REJECT:
        notificationTypeId = 'QUOTATION_REJECTED';
        break;
      case CustomerQuotationAction.APPEAL:
        notificationTypeId = 'QUOTATION_APPEALED';
        break;
      case CustomerQuotationAction.CANCEL:
        notificationTypeId = 'QUOTATION_CANCELED';
        break;
      default:
        // It's not necessary to throw an error here because the action is already validated
        // We just are not going to send a notification in this case
        this.logger.error({
          message: 'INVALID_ACTION',
          action: customerActionDto.action,
        });
    }

    if (notificationTypeId) {
      const queueMessage: unknown = {
        jobId: notificationTypeId,
        notificationTypeId: 'PUSH' as const,
        metadata: {
          ...(customerActionDto.action === CustomerQuotationAction.REJECT && {
            by: 'customer',
          }),
          quotationId,
          artistId: quotation.artistId,
          customerId: quotation.customerId,
          ...(customerActionDto.action === CustomerQuotationAction.REJECT && {
            rejectionReason: customerActionDto.rejectionReason,
          }),
          ...(customerActionDto.action === CustomerQuotationAction.APPEAL && {
            appealReason: customerActionDto.appealReason,
          }),
          additionalDetails: customerActionDto.additionalDetails,
        },
      };

      await this.notificationQueue.add(queueMessage);
    }

    await this.syncQueue.add({
      jobId: 'CREATE_AGENDA_EVENT',
      metadata: {
        artistId: quotation.artistId,
        quotationId: quotation.id,
      },
    } as CreateAgendaEventJobType);

    return {
      message: 'Quotation updated successfully',
      updated: true,
    };
  }
}
