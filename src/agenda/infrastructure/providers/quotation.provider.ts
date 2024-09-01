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
  Quotation,
  QuotationArtistRejectReason,
  QuotationCustomerAppealReason,
  QuotationCustomerCancelReason,
  QuotationCustomerRejectReason,
  QuotationRejectBy,
  QuotationStatus,
  QuotationSystemCancelReason,
  QuotationUserType,
} from '../entities/quotation.entity';

type ActionType = 'artist' | 'customer' | 'system';

interface UpdateQuotationDto {
  action: string;
  estimatedCost?: number;
  appointmentDate?: Date;
  appointmentDuration?: number;
  rejectionReason?: QuotationArtistRejectReason | QuotationCustomerRejectReason;
  appealReason?: QuotationCustomerAppealReason;
  cancelReason?: QuotationCustomerCancelReason | QuotationSystemCancelReason;
  additionalDetails?: string;
}
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

  async updateQuotationState(
    quotationId: number,
    userId: number,
    actionType: ActionType,
    dto: UpdateQuotationDto,
    newStatus: QuotationStatus,
    proposedDesigns?: MultimediasMetadataInterface,
  ): Promise<{ transactionIsOK: boolean; updatedQuotation: Quotation }> {
    let transactionIsOK = false;
    let updatedQuotation: Quotation = null;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch current quotation
      const currentQuotationSql = `
        SELECT json_build_object(
          'id', id,
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
          'canceledDate', canceled_date,
          'lastUpdatedBy', last_updated_by,
          'lastUpdatedByUserType', last_updated_by_user_type,
          'updatedAt', updated_at
        ) AS quotation
        FROM quotation 
        WHERE id = $1;
      `;
      const [{ quotation: currentQuotation }] = await queryRunner.query(
        currentQuotationSql,
        [quotationId],
      );

      if (!currentQuotation) {
        throw new Error(`Quotation with id ${quotationId} not found`);
      }

      // Update quotation
      const updateQuotationSql = `
      UPDATE quotation
      SET status = $1::quotation_status, 
          estimated_cost = COALESCE($2, estimated_cost),
          appointment_date = COALESCE($3, appointment_date),
          appointment_duration = COALESCE($4, appointment_duration),
          response_date = NOW(),
          proposed_designs = COALESCE($5, proposed_designs),
          ${
            actionType === 'artist'
              ? 'artist_reject_reason'
              : 'customer_reject_reason'
          } = $6::${
        actionType === 'artist'
          ? 'quotation_artist_reject_reason'
          : 'quotation_customer_reject_reason'
      },
          appealed_reason = $7::quotation_appealed_reason,
          ${
            actionType === 'customer'
              ? 'customer_cancel_reason'
              : 'system_cancel_reason'
          } = $8::${
        actionType === 'customer'
          ? 'quotation_customer_cancel_reason'
          : 'quotation_system_cancel_reason'
      },
          cancel_reason_details = CASE WHEN $1::quotation_status = 'canceled' THEN $9 ELSE cancel_reason_details END,
          canceled_by = CASE 
            WHEN $1::quotation_status = 'canceled' AND $10 IN ('customer', 'system') 
            THEN $10::quotation_canceled_by 
            ELSE canceled_by 
          END,
          canceled_date = CASE WHEN $1::quotation_status = 'canceled' THEN NOW() ELSE canceled_date END,
          reject_reason_details = CASE WHEN $1::quotation_status = 'rejected' THEN $9 ELSE reject_reason_details END,
          reject_by = CASE WHEN $1::quotation_status = 'rejected' THEN $11::quotation_reject_by ELSE reject_by END,
          rejected_date = CASE WHEN $1::quotation_status = 'rejected' THEN NOW() ELSE rejected_date END,
          appealed_date = CASE WHEN $7 IS NOT NULL THEN NOW() ELSE appealed_date END,
          last_updated_by = $13,
          last_updated_by_user_type = $14::quotation_user_type,
          updated_at = NOW()
      WHERE id = $12
      RETURNING json_build_object(
        'id', id,
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
        'canceledDate', canceled_date,
        'lastUpdatedBy', last_updated_by,
        'lastUpdatedByUserType', last_updated_by_user_type,
        'updatedAt', updated_at
      ) as quotation;
    `;
      const updateParams = [
        newStatus,
        dto.estimatedCost,
        dto.appointmentDate,
        dto.appointmentDuration,
        proposedDesigns,
        dto.rejectionReason,
        dto.appealReason,
        dto.cancelReason,
        dto.additionalDetails,
        actionType,
        actionType as QuotationRejectBy,
        quotationId,
        userId,
        actionType as QuotationUserType,
      ];
      const [updatedQuotationResult] = await queryRunner.query(
        updateQuotationSql,
        updateParams,
      );
      updatedQuotation = updatedQuotationResult[0].quotation as Quotation;

      // Create history entry
      const createHistorySql = `
        INSERT INTO quotation_history (
          quotation_id, previous_status, new_status, changed_at, changed_by, changed_by_user_type, 
          previous_estimated_cost, new_estimated_cost, previous_appointment_date, new_appointment_date, 
          previous_appointment_duration, new_appointment_duration, additional_details, rejection_reason, 
          appealed_reason, cancellation_reason, last_updated_by, last_updated_by_user_type
        )
        VALUES ($1, $2::quotation_status, $3::quotation_status, NOW(), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::quotation_appealed_reason, $15, $16, $17::quotation_user_type);
      `;
      const historyParams = [
        quotationId,
        currentQuotation.status,
        newStatus,
        userId,
        actionType,
        currentQuotation.estimatedCost,
        dto.estimatedCost,
        currentQuotation.appointmentDate,
        dto.appointmentDate,
        currentQuotation.appointmentDuration,
        dto.appointmentDuration,
        dto.additionalDetails,
        dto.rejectionReason,
        dto.appealReason,
        dto.cancelReason,
        userId,
        actionType as QuotationUserType,
      ];
      await queryRunner.query(createHistorySql, historyParams);

      await queryRunner.commitTransaction();
      transactionIsOK = true;
    } catch (error) {
      this.logger.error(
        `Error in update quotation state transaction: ${
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
