import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bull';

import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import { StencilRepository } from '../../artists/infrastructure/repositories/stencil.repository';
import { CustomerRepository } from '../../customers/infrastructure/providers/customer.repository';
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
import { CreateQuotationReqDto } from '../infrastructure/dtos/createQuotationReq.dto';
import { QuotationStatus } from '../infrastructure/entities/quotation.entity';
import { QuotationRepository } from '../infrastructure/repositories/quotation.provider';
import { QuotationCreatedJobType } from '../../queues/notifications/domain/schemas/quotation';

@Injectable()
export class CreateQuotationUseCase
  extends BaseUseCase
  implements UseCase, OnModuleDestroy
{
  constructor(
    private readonly quotationProvider: QuotationRepository,
    private readonly customerProvider: CustomerRepository,
    private readonly artistProvider: ArtistRepository,
    private readonly stencilProvider: StencilRepository,
    private readonly multimediasService: MultimediasService,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(CreateQuotationUseCase.name);
  }

  async onModuleDestroy() {
    await this.notificationQueue.close();
  }

  async execute(
    createQuotationDto: CreateQuotationReqDto,
    referenceImages: FileInterface[],
  ): Promise<{
    id: string;
    message: string;
    created: boolean;
  }> {
    const existsArtist = await this.artistProvider.exists(
      createQuotationDto.artistId,
    );

    if (!existsArtist) {
      throw new DomainNotFound('Artist not found');
    }

    const existsCustomer = await this.customerProvider.exists(
      createQuotationDto.customerId,
    );

    if (!existsCustomer) {
      throw new DomainNotFound('Customer not found');
    }

    // Validate stencil if provided
    if (createQuotationDto.stencilId) {
      const stencil = await this.stencilProvider.findStencilById(createQuotationDto.stencilId);
      if (!stencil) {
        throw new DomainNotFound('Stencil not found');
      }
    }

    let quotationId: string;

    const queryRunner = this.quotationProvider.source.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createQuotationSql = `
        INSERT INTO quotation (customer_id, artist_id, description, status, stencil_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id;
      `;

      const quotationParams = [
        createQuotationDto.customerId,
        createQuotationDto.artistId,
        createQuotationDto.description,
        'pending' as QuotationStatus,
        createQuotationDto.stencilId || null,
      ];

      const quotationResult = await queryRunner.query(
        createQuotationSql,
        quotationParams,
      );

      if (!quotationResult[0]) {
        throw new DomainBadRule('Error creating quotation');
      }

      quotationId = quotationResult[0].id as string;

      if (referenceImages.length) {
        const multimedias = await this.multimediasService.uploadReferenceImages(
          referenceImages,
          quotationId,
          createQuotationDto.artistId,
        );

        const updateQuotationSql = `
          UPDATE quotation
          SET reference_images = $1
          WHERE id = $2;
        `;

        await queryRunner.query(updateQuotationSql, [multimedias, quotationId]);
      }

      const queueMessage: QuotationCreatedJobType = {
        jobId: 'QUOTATION_CREATED',
        metadata: {
          quotationId: quotationId,
          artistId: createQuotationDto.artistId,
          customerId: createQuotationDto.customerId,
        },
        notificationTypeId: 'EMAIL_AND_PUSH',
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
      id: quotationId,
      message: 'Quotation created successfully',
      created: true,
    };
  }
}
