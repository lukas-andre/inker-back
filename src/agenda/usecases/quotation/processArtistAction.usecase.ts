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
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { queues } from '../../../queues/queues';
import { QuotationStateMachine } from '../../domain/quotation.statemachine';
import {
  ArtistQuoteAction,
  ArtistQuoteDto,
} from '../../infrastructure/dtos/quotations.dto';
import { QuotationStatus } from '../../infrastructure/entities/quotation.entity';
import { QuotationProvider } from '../../infrastructure/providers/quotation.provider';

@Injectable()
export class ProcessArtistActionUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationProvider: QuotationProvider,
    private readonly multimediasService: MultimediasService,
    private readonly quotationStateMachine: QuotationStateMachine,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(ProcessArtistActionUseCase.name);
  }

  async execute(
    quotationId: number,
    artistQuoteDto: ArtistQuoteDto,
    proposedDesigns: FileInterface[],
  ): Promise<{ message: string; updated: boolean }> {
    const quotation = await this.quotationProvider.findById(quotationId);

    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }

    let newStatus: QuotationStatus;
    try {
      switch (artistQuoteDto.action) {
        case ArtistQuoteAction.QUOTE:
          newStatus = this.quotationStateMachine.transition(
            quotation,
            'quoted',
          );
          break;
        case ArtistQuoteAction.REJECT:
          newStatus = this.quotationStateMachine.transition(
            quotation,
            'rejected',
          );
          break;
        case ArtistQuoteAction.ACCEPT_APPEAL:
          newStatus = this.quotationStateMachine.transition(
            quotation,
            'accepted',
          );
          break;
        case ArtistQuoteAction.REJECT_APPEAL:
          newStatus = this.quotationStateMachine.transition(
            quotation,
            'rejected',
          );
          break;
        default:
          throw new DomainBadRule('Invalid action');
      }
    } catch (error) {
      throw new DomainBadRule((error as Error).message);
    }

    let multimedias;
    if (proposedDesigns && proposedDesigns.length) {
      multimedias = await this.multimediasService.uploadProposedDesigns(
        proposedDesigns,
        quotationId,
        quotation.artistId,
      );
    }

    const { transactionIsOK, updatedQuotation } =
      await this.quotationProvider.updateQuotationState(
        quotationId,
        quotation.artistId,
        'artist',
        {
          action: artistQuoteDto.action,
          additionalDetails: artistQuoteDto.additionalDetails,
          appointmentDate: artistQuoteDto.appointmentDate,
          appointmentDuration: artistQuoteDto.appointmentDuration,
          estimatedCost: artistQuoteDto.estimatedCost,
          rejectionReason: artistQuoteDto.rejectionReason,
        },
        newStatus,
        multimedias,
      );

    if (!transactionIsOK || !updatedQuotation) {
      throw new DomainBadRule('Error updating quotation');
    }

    // const queueMessage = {
    //   jobId: 'QUOTATION_ARTIST_ACTION',
    //   metadata: {
    //     quotationId: quotationId,
    //     artistId: quotation.artistId,
    //     customerId: quotation.customerId,
    //     action: artistQuoteDto.action,
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
