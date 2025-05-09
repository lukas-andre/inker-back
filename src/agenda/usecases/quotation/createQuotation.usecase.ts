import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bull';

import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import { StencilRepository } from '../../../artists/infrastructure/repositories/stencil.repository';
import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import { TattooDesignCacheRepository } from '../../../tattoo-generator/infrastructure/database/repositories/tattooDesignCache.repository';
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
import { CreateQuotationReqDto } from '../../infrastructure/dtos/createQuotationReq.dto';
import {
  QuotationStatus,
  QuotationType,
} from '../../infrastructure/entities/quotation.entity';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';
import { QuotationCreatedJobType } from '../../../queues/notifications/domain/schemas/quotation';

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
    private readonly tattooDesignCacheProvider: TattooDesignCacheRepository,
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
    const { type, artistId, description, stencilId, customerLat, customerLon, customerTravelRadiusKm, tattooDesignCacheId, tattooDesignImageUrl } = createQuotationDto;

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
      if (stencilId) {
        throw new DomainBadRule('stencilId cannot be provided for OPEN quotations if tattooDesignCacheId is used');
      }
      if (tattooDesignCacheId && !tattooDesignImageUrl) {
        throw new DomainBadRule('tattooDesignImageUrl is required when tattooDesignCacheId is provided');
      }
      if (!tattooDesignImageUrl) {
        throw new DomainBadRule('tattooDesignCacheId is required when tattooDesignImageUrl is provided');
      }
    }

    // 3. Validate stencil if provided
    if (stencilId) {
      if (tattooDesignCacheId) {
        throw new DomainBadRule('stencilId and tattooDesignCacheId cannot both be provided');
      }
      const stencil = await this.stencilProvider.findStencilById(stencilId);
      if (!stencil) {
        throw new DomainNotFound('Stencil not found');
      }
    }

    // 3.5 Validate Tattoo Design Cache if provided
    if (tattooDesignCacheId) {
      if (type !== QuotationType.OPEN) {
        throw new DomainBadRule('tattooDesignCacheId is only allowed for OPEN quotations');
      }
      let tattooDesign = await this.tattooDesignCacheProvider.findById(tattooDesignCacheId);
      if (!tattooDesign) {
        tattooDesign = await this.tattooDesignCacheProvider.findByImageUrl(tattooDesignImageUrl);
        if (!tattooDesign) {
          throw new DomainNotFound('Tattoo Design Cache not found');
        }
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
        'tattoo_design_cache_id',
        'tattoo_design_image_url',
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
        tattooDesignCacheId || null,
        tattooDesignImageUrl || null,
        'NOW()', // Use SQL function for timestamp
        'NOW()'
      ];

      // Agregar campos de presupuesto solo para OPEN
      if (type === QuotationType.OPEN) {
        if (createQuotationDto.minBudget) {
          columns.push('min_budget');
          values.push(JSON.stringify(createQuotationDto.minBudget));
        }
        if (createQuotationDto.maxBudget) {
          columns.push('max_budget');
          values.push(JSON.stringify(createQuotationDto.maxBudget));
        }
        if (createQuotationDto.referenceBudget) {
          columns.push('reference_budget');
          values.push(JSON.stringify(createQuotationDto.referenceBudget));
        }
        if (createQuotationDto.generatedImageId) {
          columns.push('generated_image_id');
          values.push(createQuotationDto.generatedImageId);
        }
      }

      // Filter out columns with null values specifically for OPEN type to avoid sending nulls explicitly if not needed
      // Though binding null is generally fine
      const nonNullIndices = values.map((v, i) => v !== undefined ? i : -1).filter(i => i !== -1);
      const filteredColumns = nonNullIndices.map(i => columns[i]);
      const filteredValues = nonNullIndices.map(i => values[i]);
      const placeholders = filteredValues.map((_, i) => `$${i + 1}`).join(', ');

      const createQuotationSql = `
        INSERT INTO quotation (${filteredColumns.join(', ')})
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
      if (referenceImages) {
        const multimedias = await this.multimediasService.uploadReferenceImages(
          referenceImages,
          quotationId,
          artistId, 
        );

        const updateQuotationSql = `
          UPDATE quotation
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
