import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bull';

import { ArtistProvider } from '../../artists/infrastructure/database/artist.provider';
import {
  DomainBadRule,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { queues } from '../../queues/queues';
import { QuotationStateMachine } from '../domain/quotation.statemachine';
import { ReplyQuotationReqDto } from '../infrastructure/dtos/replyQuotationReq.dto';
import { QuotationStatus } from '../infrastructure/entities/quotation.entity';
import { QuotationRole } from '../infrastructure/entities/quotationHistory.entity';
import { QuotationProvider } from '../infrastructure/providers/quotation.provider';

@Injectable()
export class ReplyQuotationUseCase
  extends BaseUseCase
  implements UseCase, OnModuleDestroy
{
  public static status: QuotationStatus = 'quoted';

  constructor(
    private readonly quotationProvider: QuotationProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly quotationStateMachine: QuotationStateMachine,
    private readonly multimediaService: MultimediasService,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(ReplyQuotationUseCase.name);
  }

  async onModuleDestroy() {
    await this.notificationQueue.close();
  }

  async execute(
    replyQuotationDto: ReplyQuotationReqDto,
    proposedImages: FileInterface[],
  ): Promise<{
    message: string;
    updated: boolean;
  }> {
    const {
      artistId,
      quotationId,
      estimatedCost,
      appointmentDate,
      appointmentDuration,
    } = replyQuotationDto;

    const existsArtist = await this.artistProvider.exists(artistId);

    if (!existsArtist) {
      throw new DomainNotFound('Artist not found');
    }

    const quotation = await this.quotationProvider.findById(quotationId);

    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }

    const queryRunner = this.quotationProvider.source.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldStatus = quotation.status;
      this.quotationStateMachine.transition(
        quotation,
        ReplyQuotationUseCase.status,
      );

      await this.multimediaService.uploadProposedImages(
        proposedImages,
        quotation.id,
        artistId,
      );

      const updateQuotationSql = `
        UPDATE quotation
        SET estimated_cost = $1,
            status = $2,
            response_date = NOW(),
            appointment_date = $3,
            appointment_duration = $4,
            updated_at = NOW()
        WHERE id = $5;
      `;

      const updateQuotationParams: [
        number,
        QuotationStatus,
        Date | null,
        number | null,
        number,
      ] = [
        estimatedCost,
        ReplyQuotationUseCase.status,
        appointmentDate || null,
        appointmentDuration || null,
        quotationId,
      ];

      await queryRunner.query(updateQuotationSql, updateQuotationParams);

      const createHistorySql = `
        INSERT INTO quotation_history (
          quotation_id, 
          status, 
          changed_at, 
          changed_by, 
          changed_by_user_type,
          created_at, 
          updated_at
        )
        VALUES ($1, $2, NOW(), $3, $4, NOW(), NOW());
      `;

      const historyParams: [number, QuotationStatus, number, QuotationRole] = [
        quotationId,
        oldStatus,
        artistId,
        'customer',
      ];

      await queryRunner.query(createHistorySql, historyParams);

      const queueMessage = {
        jobId: 'QUOTATION_REPLIED',
        metadata: {
          quotationId,
          artistId,
          estimatedCost,
        },
        notificationTypeId: 'EMAIL',
      };

      await this.notificationQueue.add(queueMessage);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw new DomainBadRule('Error during transaction');
    } finally {
      await queryRunner.release();
    }

    return {
      message: 'Quotation replied successfully',
      updated: true,
    };
  }
}
