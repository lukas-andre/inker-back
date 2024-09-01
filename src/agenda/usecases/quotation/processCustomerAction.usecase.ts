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
          cancelReason: customerActionDto.cancelReason,
        },
        newStatus,
      );
    if (!transactionIsOK || !updatedQuotation) {
      throw new DomainBadRule('Error updating quotation');
    }

    // Uncomment this section when ready to implement notifications
    // const queueMessage = {
    //   jobId: 'QUOTATION_CUSTOMER_ACTION',
    //   metadata: {
    //     quotationId: quotationId,
    //     artistId: quotation.artistId,
    //     customerId: quotation.customerId,
    //     action: customerActionDto.action,
    //   },
    //   notificationTypeId: 'EMAIL',
    // };
    // await this.notificationQueue.add(queueMessage);

    return {
      message: 'Quotation updated successfully',
      updated: true,
    };
  }
}
