import { Injectable } from '@nestjs/common';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  DeleteResult,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { DBServiceSaveException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import {
  ArtistQuoteAction,
  ArtistQuoteDto,
  CustomerQuotationAction,
  CustomerQuotationActionDto,
  QuotationArtistRejectDto,
  QuotationEarlyCancelDto,
} from '../dtos/quotations.dto';
import { Quotation, QuotationStatus } from '../entities/quotation.entity';

@Injectable()
export class QuotationProvider extends BaseComponent {
  constructor(
    @InjectRepository(Quotation, AGENDA_DB_CONNECTION_NAME)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectDataSource(AGENDA_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(AGENDA_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
  ) {
    super(QuotationProvider.name);
  }

  get source(): DataSource {
    return this.dataSource;
  }

  get manager(): EntityManager {
    return this.entityManager;
  }

  get repo(): Repository<Quotation> {
    return this.quotationRepository;
  }

  async exists(id: number): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.quotationRepository.query(
      `SELECT EXISTS(SELECT 1 FROM quotation q WHERE q.id = $1)`,
      [id],
    );

    return result.exists;
  }

  async findById(id: number) {
    return this.quotationRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Quotation>) {
    return this.quotationRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<Quotation>) {
    return this.quotationRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Quotation>,
  ): Promise<Quotation | undefined> {
    return this.quotationRepository.findOne(options);
  }

  async save(quotation: DeepPartial<Quotation>): Promise<Quotation> {
    try {
      return await this.quotationRepository.save(quotation);
    } catch (error) {
      throw new DBServiceSaveException(this, 'Trouble saving quotation', error);
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.quotationRepository.delete(id);
  }

  async updateStatus(id: number, status: QuotationStatus) {
    return this.quotationRepository.query(
      `UPDATE quotation SET status = $1, updated_at = now() WHERE id = $2`,
      [status, id],
    );
  }

  async earlyCancelQuotationTransaction(
    quotationId: number,
    userId: number,
    dto: QuotationEarlyCancelDto,
  ): Promise<{ transactionIsOK: boolean; updatedQuotation: Quotation }> {
    let transactionIsOK = false;
    let updatedQuotation: Quotation = null;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateQuotationSql = `
        UPDATE quotation
        SET status = $1, canceled_by = $2, canceled_date = NOW(), customer_cancel_reason = $3, cancel_reason_details = $4
        WHERE id = $5
        RETURNING json_build_object(
          'id', id,
          'createdAt', created_at,
          'updatedAt', updated_at,
          'customerId', customer_id,
          'artistId', artist_id,
          'description', description,
          'referenceImages', reference_images,
          'proposedDesigns', proposed_designs,
          'status', status,
          'estimatedCost', estimated_cost,
          'responseDate', response_date,
          'appointmentDate', appointment_date,
          'appointmentDuration', appointment_duration,
          'rejectBy', reject_by,
          'customerRejectReason', customer_reject_reason,
          'artistRejectReason', artist_reject_reason,
          'rejectReasonDetails', reject_reason_details,
          'rejectedDate', rejected_date,
          'appealedReason', appealed_reason,
          'appealedDate', appealed_date,
          'canceledBy', canceled_by,
          'customerCancelReason', customer_cancel_reason,
          'systemCancelReason', system_cancel_reason,
          'cancelReasonDetails', cancel_reason_details,
          'canceledDate', canceled_date
        ) as quotation;
    `;
      const quotationParams = [
        'canceled',
        'customer',
        dto.reason,
        dto.cancelReasonDetails || '',
        quotationId,
      ];
      const [updatedQuotationResult] = await queryRunner.query(
        updateQuotationSql,
        quotationParams,
      );

      // TODO: add schema validation
      updatedQuotation = updatedQuotationResult[0].quotation;

      // Create history
      const createHistorySql = `
        INSERT INTO quotation_history (quotation_id, previous_status, new_status, changed_at, changed_by, changed_by_user_type, cancellation_reason, additional_details)
        VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7);
      `;
      const historyParams = [
        quotationId,
        'pending',
        'canceled',
        userId,
        'customer',
        dto.reason,
        dto.cancelReasonDetails,
      ];
      await queryRunner.query(createHistorySql, historyParams);

      await queryRunner.commitTransaction();
      transactionIsOK = true;
    } catch (error) {
      this.logger.error(
        `Error in early cancellation transaction: ${(error as any)?.message}`,
      );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return { transactionIsOK, updatedQuotation };
  }

  async artistRejectQuotationTransaction(
    quotationId: number,
    userId: number,
    dto: QuotationArtistRejectDto,
  ): Promise<{
    transactionIsOK: boolean;
    updatedQuotation: Quotation;
  }> {
    let transactionIsOK = false;
    let updatedQuotation: Quotation = null;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, fetch the current quotation
      const currentQuotationSql = `
        SELECT status FROM quotation WHERE id = $1;
      `;
      const [currentQuotation] = await queryRunner.query(currentQuotationSql, [
        quotationId,
      ]);

      if (!currentQuotation) {
        throw new Error(`Quotation with id ${quotationId} not found`);
      }

      // Update the quotation
      const updateQuotationSql = `
        UPDATE quotation
        SET status = $1, reject_by = $2, rejected_date = NOW(), artist_reject_reason = $3, reject_reason_details = $4
        WHERE id = $5
        RETURNING json_build_object(
          'id', id,
          'createdAt', created_at,
          'updatedAt', updated_at,
          'customerId', customer_id,
          'artistId', artist_id,
          'description', description,
          'referenceImages', reference_images,
          'proposedDesigns', proposed_designs,
          'status', status,
          'estimatedCost', estimated_cost,
          'responseDate', response_date,
          'appointmentDate', appointment_date,
          'appointmentDuration', appointment_duration,
          'rejectBy', reject_by,
          'customerRejectReason', customer_reject_reason,
          'artistRejectReason', artist_reject_reason,
          'rejectReasonDetails', reject_reason_details,
          'rejectedDate', rejected_date,
          'appealedReason', appealed_reason,
          'appealedDate', appealed_date,
          'canceledBy', canceled_by,
          'customerCancelReason', customer_cancel_reason,
          'systemCancelReason', system_cancel_reason,
          'cancelReasonDetails', cancel_reason_details,
          'canceledDate', canceled_date
        ) as quotation;
      `;
      const quotationParams = [
        'rejected',
        'artist',
        dto.reason,
        dto.rejectReasonDetails,
        quotationId,
      ];
      const [updatedQuotationResult] = await queryRunner.query(
        updateQuotationSql,
        quotationParams,
      );

      updatedQuotation = updatedQuotationResult[0].quotation;

      // Create history entry using current values
      const createHistorySql = `
        INSERT INTO quotation_history (quotation_id, previous_status, new_status, changed_at, changed_by, changed_by_user_type, rejection_reason, additional_details)
        VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7);
      `;
      const historyParams = [
        quotationId,
        currentQuotation.status,
        'rejected',
        userId,
        'artist',
        dto.reason,
        dto.rejectReasonDetails,
      ];
      await queryRunner.query(createHistorySql, historyParams);

      await queryRunner.commitTransaction();
      transactionIsOK = true;
    } catch (error) {
      this.logger.error(
        `Error in artist rejection transaction: ${(error as any)?.message}`,
        (error as any)?.stack,
      );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return { transactionIsOK, updatedQuotation };
  }

  async artistSendQuotationTransaction(
    quotationId: number,
    artistId: number,
    dto: ArtistQuoteDto,
    newStatus: QuotationStatus,
    proposedDesigns?: MultimediasMetadataInterface,
  ): Promise<{ transactionIsOK: boolean; updatedQuotation: Quotation }> {
    let transactionIsOK = false;
    let updatedQuotation: Quotation = null;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, fetch the current quotation
      const currentQuotationSql = `
        SELECT * FROM quotation WHERE id = $1;
      `;
      const [currentQuotation] = await queryRunner.query(currentQuotationSql, [
        quotationId,
      ]);

      if (!currentQuotation) {
        throw new Error(`Quotation with id ${quotationId} not found`);
      }

      // Update the quotation
      const updateQuotationSql = `
        UPDATE quotation
        SET status = $1, estimated_cost = $2, appointment_date = $3, appointment_duration = $4, 
            response_date = NOW(), proposed_designs = $5, 
            artist_reject_reason = $6, reject_reason_details = $7
        WHERE id = $8
        RETURNING *;
      `;
      const quotationParams = [
        newStatus,
        dto.estimatedCost,
        dto.appointmentDate,
        dto.appointmentDuration,
        proposedDesigns,
        dto.action === ArtistQuoteAction.REJECT ? dto.rejectionReason : null,
        dto.additionalDetails,
        quotationId,
      ];
      const [updatedQuotationResult] = await queryRunner.query(
        updateQuotationSql,
        quotationParams,
      );

      updatedQuotation = updatedQuotationResult;

      // Create history entry
      const createHistorySql = `
        INSERT INTO quotation_history (
          quotation_id, previous_status, new_status, changed_at, changed_by, changed_by_user_type, 
          previous_estimated_cost, new_estimated_cost, previous_appointment_date, new_appointment_date, 
          previous_appointment_duration, new_appointment_duration, additional_details, rejection_reason
        )
        VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
      `;
      const historyParams = [
        quotationId,
        currentQuotation.status,
        newStatus,
        artistId,
        'artist',
        currentQuotation.estimated_cost,
        dto.estimatedCost,
        currentQuotation.appointment_date,
        dto.appointmentDate,
        currentQuotation.appointment_duration,
        dto.appointmentDuration,
        dto.additionalDetails,
        dto.action === ArtistQuoteAction.REJECT ? dto.rejectionReason : null,
      ];
      await queryRunner.query(createHistorySql, historyParams);

      await queryRunner.commitTransaction();
      transactionIsOK = true;
    } catch (error) {
      this.logger.error(
        `Error in artist send quotation transaction: ${
          (error as any)?.message
        }`,
        (error as any)?.stack,
      );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return { transactionIsOK, updatedQuotation };
  }

  async customerQuotationActionTransaction(
    quotationId: number,
    customerId: number,
    dto: CustomerQuotationActionDto,
    newStatus: QuotationStatus,
  ): Promise<{ transactionIsOK: boolean; updatedQuotation: Quotation }> {
    let transactionIsOK = false;
    let updatedQuotation: Quotation = null;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch the current quotation
      const currentQuotationSql = `
        SELECT * FROM quotation WHERE id = $1;
      `;
      const [currentQuotation] = await queryRunner.query(currentQuotationSql, [
        quotationId,
      ]);

      if (!currentQuotation) {
        throw new Error(`Quotation with id ${quotationId} not found`);
      }

      // Update the quotation
      const updateQuotationSql = `
        UPDATE quotation
        SET status = $1, 
            customer_reject_reason = $2,
            appealed_reason = $3
        WHERE id = $4
        RETURNING *;
      `;
      const quotationParams = [
        newStatus,
        dto.action === CustomerQuotationAction.REJECT
          ? dto.rejectionReason
          : null,
        dto.action === CustomerQuotationAction.APPEAL ? dto.appealReason : null,
        quotationId,
      ];
      const [updatedQuotationResult] = await queryRunner.query(
        updateQuotationSql,
        quotationParams,
      );

      updatedQuotation = updatedQuotationResult;

      // Create history entry
      const createHistorySql = `
        INSERT INTO quotation_history (
          quotation_id, previous_status, new_status, changed_at, changed_by, changed_by_user_type, 
          rejection_reason, appealed_reason, additional_details
        )
        VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8);
      `;
      const historyParams = [
        quotationId,
        currentQuotation.status,
        newStatus,
        customerId,
        'customer',
        dto.action === CustomerQuotationAction.REJECT
          ? dto.rejectionReason
          : null,
        dto.action === CustomerQuotationAction.APPEAL ? dto.appealReason : null,
        dto.additionalDetails,
      ];
      await queryRunner.query(createHistorySql, historyParams);

      await queryRunner.commitTransaction();
      transactionIsOK = true;
    } catch (error) {
      this.logger.error(
        `Error in customer quotation action transaction: ${
          (error as any)?.message
        }`,
        (error as any)?.stack,
      );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return { transactionIsOK, updatedQuotation };
  }
}
