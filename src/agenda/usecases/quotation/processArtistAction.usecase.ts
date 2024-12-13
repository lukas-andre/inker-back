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
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { queues } from '../../../queues/queues';
import { QuotationStateMachine } from '../../domain/quotation.statemachine';
import {
  ArtistQuotationActionDto,
  ArtistQuoteAction,
} from '../../infrastructure/dtos/artistQuotationAction.dto';
import { QuotationStatus } from '../../infrastructure/entities/quotation.entity';
import { QuotationProvider } from '../../infrastructure/providers/quotation.provider';
import { QuotationArtistActionJobIdType, QuotationArtistActionJobType } from '../../../queues/notifications/domain/schemas/quotation';

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
    userId: number,
    quotationId: number,
    artistQuoteDto: ArtistQuotationActionDto,
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

    let multimedias: MultimediasMetadataInterface;
    if (proposedDesigns && proposedDesigns.length > 0) {
      multimedias = await this.multimediasService.uploadProposedDesigns(
        proposedDesigns,
        quotationId,
        quotation.artistId,
      );
    }

    const { transactionIsOK, updatedQuotation } =
      await this.quotationProvider.updateQuotationState(
        quotationId,
        userId,
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

    let notificationTypeId: QuotationArtistActionJobIdType;

    switch (artistQuoteDto.action) {
      case ArtistQuoteAction.QUOTE:
        notificationTypeId = 'QUOTATION_REPLIED';
        break;
      case ArtistQuoteAction.REJECT:
      case ArtistQuoteAction.REJECT_APPEAL:
        notificationTypeId = 'QUOTATION_REJECTED';
        break;
      default:
        this.logger.error({
          message: 'INVALID_ACTION',
          action: artistQuoteDto.action,
        });
    }

    if (notificationTypeId) {
      const queueMessage: unknown = {
        jobId: notificationTypeId,
        notificationTypeId: 'PUSH' as const,
        metadata: {
          ...(artistQuoteDto.action === ArtistQuoteAction.REJECT && { 
            by: 'artist',
          }),
          quotationId,
          artistId: quotation.artistId,
          customerId: quotation.customerId,
          ...(artistQuoteDto.action === ArtistQuoteAction.REJECT && { 
            rejectionReason: artistQuoteDto.rejectionReason 
          }),
          estimatedCost: artistQuoteDto.estimatedCost,
          appointmentDate: artistQuoteDto.appointmentDate,
          appointmentDuration: artistQuoteDto.appointmentDuration,
          additionalDetails: artistQuoteDto.additionalDetails,
        },
      };

      await this.notificationQueue.add(queueMessage);
    }

    return {
      message: 'Quotation updated successfully',
      updated: true,
    };
  }
}
