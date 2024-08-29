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
import { UserType } from '../../../users/domain/enums/userType.enum';
import { QuotationStateMachine } from '../../domain/quotation.statemachine';
import { QuotationEarlyCancelDto } from '../../infrastructure/dtos/quotations.dto';
import { QuotationProvider } from '../../infrastructure/providers/quotation.provider';

@Injectable()
export class EarlyCancellationUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationProvider: QuotationProvider,
    private readonly quotationStateMachine: QuotationStateMachine,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(EarlyCancellationUseCase.name);
  }

  async execute(
    quotationId: number,
    userId: number,
    userType: UserType,
    dto: QuotationEarlyCancelDto,
  ): Promise<void> {
    const quotation = await this.quotationProvider.findById(quotationId);

    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }

    if (userType !== UserType.CUSTOMER || quotation.customerId !== userId) {
      throw new DomainBadRule(
        'Only the customer can perform an early cancellation',
      );
    }

    try {
      this.quotationStateMachine.transition(quotation, 'canceled');

      const { transactionIsOK, updatedQuotation } =
        await this.quotationProvider.earlyCancelQuotationTransaction(
          quotationId,
          userId,
          dto,
        );

      if (!transactionIsOK) {
        throw new Error('Transaction failed');
      }

      // TODO: Enviar notificación
      // const queueMessage: EarlyQuotationCanceledJobType = {
      //   jobId: 'EARLY_QUOTATION_CANCELED',
      //   metadata: {
      //     quotationId,
      //     cancelReason: dto.reason,
      //     artistId: quotation.artistId,
      //     customerId: quotation.customerId,
      //   },
      //   notificationTypeId: 'EMAIL',
      // };
      // await this.notificationQueue.add(queueMessage);
    } catch (error) {
      this.logger.error(
        `Error in early cancellation of quotation: ${(error as any)?.message}`,
      );
      throw new DomainBadRule(
        'Unable to perform early cancellation of quotation',
      );
    }
  }
}
