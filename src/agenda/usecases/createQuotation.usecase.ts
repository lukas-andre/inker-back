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
import {
  QuotationStatus,
  QuotationType,
} from '../infrastructure/entities/quotation.entity';
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
    customerId: string, // Get customerId from auth context, not DTO
    referenceImages: FileInterface[],
  ): Promise<{
    id: string;
    message: string;
    created: boolean;
  }> {
    const { type, artistId, description, stencilId, customerLat, customerLon, customerTravelRadiusKm } = createQuotationDto;

    // 1. Validate Customer
    const existsCustomer = await this.customerProvider.exists(customerId);
    if (!existsCustomer) {
      throw new DomainNotFound('Customer not found');
    }

    // 2. Validate common fields and type-specific fields
    if (type === QuotationType.DIRECT) {
      if (!artistId) {
        throw new DomainBadRule('artistId is required for DIRECT quotations');
      }
      const existsArtist = await this.artistProvider.exists(artistId);
      if (!existsArtist) {
        throw new DomainNotFound('Artist not found for DIRECT quotation');
      }
    } else if (type === QuotationType.OPEN) {
      if (artistId) {
        throw new DomainBadRule('artistId must be null for OPEN quotations');
      }
      if (customerLat == null || customerLon == null || customerTravelRadiusKm == null) {
        throw new DomainBadRule('customerLat, customerLon, and customerTravelRadiusKm are required for OPEN quotations');
      }
    }

    // 3. Validate stencil if provided
    if (stencilId) {
      const stencil = await this.stencilProvider.findStencilById(stencilId);
      if (!stencil) {
        throw new DomainNotFound('Stencil not found');
      }
    }

    let quotationId: string;
    const initialStatus = type === QuotationType.OPEN ? QuotationStatus.OPEN : QuotationStatus.PENDING;

    const queryRunner = this.quotationProvider.source.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 4. Create Quotation using SQL
      const columns = [
        'customer_id',
        'description',
        'status',
        'type',
        'stencil_id',
        'artist_id',
        'customer_lat',
        'customer_lon',
        'customer_travel_radius_km',
        'created_at',
        'updated_at'
      ];
      const values = [
        customerId,
        description,
        initialStatus,
        type,
        stencilId || null,
        artistId || null, // Null for OPEN type
        customerLat ?? null, // Null coalescing for OPEN type
        customerLon ?? null,
        customerTravelRadiusKm ?? null,
        'NOW()', // Use SQL function for timestamp
        'NOW()'
      ];

      // Filter out columns with null values specifically for OPEN type to avoid sending nulls explicitly if not needed
      // Though binding null is generally fine
      const nonNullIndices = values.map((v, i) => v !== undefined ? i : -1).filter(i => i !== -1);
      const filteredColumns = nonNullIndices.map(i => columns[i]);
      const filteredValues = nonNullIndices.map(i => values[i]);
      const placeholders = filteredValues.map((_, i) => `$${i + 1}`).join(', ');

      const createQuotationSql = `
        INSERT INTO quotations (${filteredColumns.join(', ')})
        VALUES (${placeholders})
        RETURNING id;
      `;

      this.logger.debug(`Executing SQL: ${createQuotationSql} with params: ${JSON.stringify(filteredValues)}`);

      const quotationResult = await queryRunner.query(
        createQuotationSql,
        filteredValues,
      );

      if (!quotationResult || !quotationResult[0] || !quotationResult[0].id) {
        throw new DomainBadRule('Error creating quotation - no ID returned');
      }
      quotationId = quotationResult[0].id;

      // 5. Upload Reference Images if provided
      if (referenceImages && referenceImages.length > 0) {
        const targetArtistId = type === QuotationType.DIRECT ? artistId : null; // Or decide a generic path for open quotes
        const multimedias = await this.multimediasService.uploadReferenceImages(
          referenceImages,
          quotationId,
          targetArtistId, // May need adjustment for OPEN quotations storage path
        );

        const updateQuotationSql = `
          UPDATE quotations
          SET reference_images = $1
          WHERE id = $2;
        `;
        await queryRunner.query(updateQuotationSql, [multimedias, quotationId]);
      }

      // 6. Dispatch Notification (only for DIRECT currently)
      if (type === QuotationType.DIRECT) {
        const queueMessage: QuotationCreatedJobType = {
          jobId: 'QUOTATION_CREATED',
          metadata: {
            quotationId: quotationId,
            artistId: artistId,
            customerId: customerId,
          },
          notificationTypeId: 'EMAIL_AND_PUSH',
        };
        await this.notificationQueue.add(queueMessage);
      }
      // No notification dispatched here for OPEN quotations initially

      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error(`Transaction failed: ${(error as Error).message}`, (error as Error).stack);
      await queryRunner.rollbackTransaction();
      // Re-throw specific domain errors or a generic bad rule
      if (error instanceof DomainNotFound || error instanceof DomainBadRule) {
          throw error;
      }
      throw new DomainBadRule(`Error creating quotation: ${(error as Error).message}`);
    } finally {
      await queryRunner.release();
    }

    return {
      id: quotationId,
      message: `Quotation (${type}) created successfully`,
      created: true,
    };
  }
}
