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
  FindOptionsRelations,
  Repository,
} from 'typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { MoneyEntity } from '../../../global/domain/models/money.model';
import { DBServiceSaveException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import { UserType } from '../../../users/domain/enums/userType.enum';
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
  estimatedCost?: MoneyEntity;
  appointmentDate?: Date;
  appointmentDuration?: number;
  rejectionReason?: QuotationArtistRejectReason | QuotationCustomerRejectReason;
  appealReason?: QuotationCustomerAppealReason;
  cancelReason?: QuotationCustomerCancelReason | QuotationSystemCancelReason;
  additionalDetails?: string;
}

@Injectable()
export class QuotationRepository extends BaseComponent {
  constructor(
    @InjectRepository(Quotation, AGENDA_DB_CONNECTION_NAME)
    private readonly quotationRepository: Repository<Quotation>,
    @InjectDataSource(AGENDA_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(AGENDA_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
  ) {
    super(QuotationRepository.name);
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

  async exists(id: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.quotationRepository.query(
      `SELECT EXISTS(SELECT 1 FROM quotation q WHERE q.id = $1)`,
      [id],
    );
    return result.exists;
  }

  async findById(id: string, relations?: FindOptionsRelations<Quotation>) {
    return this.quotationRepository.findOne({ where: { id }, relations });
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

  async delete(id: string): Promise<DeleteResult> {
    return this.quotationRepository.delete(id);
  }

  async updateStatus(id: string, status: QuotationStatus) {
    return this.quotationRepository.query(
      `UPDATE quotation SET status = $1, updated_at = now() WHERE id = $2`,
      [status, id],
    );
  }

  async updateQuotationState(
    quotationId: string,
    userId: string,
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
      // First we get the currentQuotation
      const [{ quotation: currentQuotation }] = await queryRunner.query(
        `
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
        `,
        [quotationId],
      );

      if (!currentQuotation) {
        throw new Error(`Quotation with id ${quotationId} not found`);
      }

      const unreadFields =
        actionType === 'artist'
          ? 'read_by_artist = false, artist_read_at = NULL, customer_read_at = NULL, read_by_customer = false'
          : 'read_by_customer = false, customer_read_at = NULL, read_by_artist = false, artist_read_at = NULL';
      // Then we make the UPDATE
      const [quotation] = await queryRunner.query(
        `
        UPDATE quotation
        SET status = $1::quotation_status, 
            ${unreadFields},
            estimated_cost = CASE 
              WHEN $2::text IS NOT NULL 
              THEN ($2::text)::jsonb
              ELSE estimated_cost 
            END,
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
        `,
        [
          newStatus,
          dto.estimatedCost ? JSON.stringify(dto.estimatedCost) : null,
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
        ],
      );

      updatedQuotation = quotation[0]?.quotation;

      // Finally we insert the history
      await queryRunner.query(
        `
        INSERT INTO quotation_history (
          quotation_id, previous_status, new_status, changed_at, changed_by, changed_by_user_type, 
          previous_estimated_cost, new_estimated_cost, previous_appointment_date, new_appointment_date, 
          previous_appointment_duration, new_appointment_duration, additional_details, rejection_reason, 
          appealed_reason, cancellation_reason, last_updated_by, last_updated_by_user_type
        )
        VALUES ($1, $2::quotation_status, $3::quotation_status, NOW(), $4, $5, 
                $6::jsonb, $7::jsonb, $8, $9, $10, $11, $12, $13, 
                $14::quotation_appealed_reason, $15, $16, $17::quotation_user_type);
        `,
        [
          quotationId,
          currentQuotation.status,
          newStatus,
          userId,
          actionType,
          currentQuotation.estimatedCost
            ? JSON.stringify(currentQuotation.estimatedCost)
            : null,
          dto.estimatedCost ? JSON.stringify(dto.estimatedCost) : null,
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
        ],
      );

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

  async markAsRead(quotationId: string, userType: UserType): Promise<boolean> {
    try {
      const result = await this.quotationRepository.query(
        `
      UPDATE quotation 
      SET 
        ${
          userType === UserType.ARTIST ? 'read_by_artist' : 'read_by_customer'
        } = true,
        ${
          userType === UserType.ARTIST ? 'artist_read_at' : 'customer_read_at'
        } = NOW(),
        updated_at = NOW()
      WHERE id = $1
      `,
        [quotationId],
      );
      return result[1] === 1;
    } catch (error) {
      this.logger.error(
        `Error marking quotation ${quotationId} as read by ${userType}:`,
        error,
      );
      return false;
    }
  }

  async updateSimple(id: string, fields: Partial<Quotation>) {
    return this.quotationRepository.update(id, fields);
  }

  /**
   * Get revenue data for monthly reports using native SQL
   */
  async getRevenueForMonth(
    quotationIds: string[],
    year: number,
    month: number,
  ): Promise<any> {
    if (quotationIds.length === 0) {
      return {
        totalRevenue: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        count: 0,
      };
    }

    try {
      const placeholders = quotationIds.map((_, i) => `$${i + 3}`).join(', ');

      const [result] = await this.quotationRepository.query(
        `SELECT 
          json_build_object(
            'totalRevenue', COALESCE(SUM((q.price->>'amount')::decimal), 0),
            'averagePrice', COALESCE(AVG((q.price->>'amount')::decimal), 0),
            'minPrice', COALESCE(MIN((q.price->>'amount')::decimal), 0),
            'maxPrice', COALESCE(MAX((q.price->>'amount')::decimal), 0),
            'count', COUNT(*),
            'currency', MAX(q.price->>'currency')
          ) as revenue
        FROM quotation q
        WHERE q.id IN (${placeholders})
          AND q.status = 'accepted'
          AND EXTRACT(YEAR FROM q.updated_at) = $1
          AND EXTRACT(MONTH FROM q.updated_at) = $2`,
        [year, month, ...quotationIds],
      );

      return (
        result?.revenue || {
          totalRevenue: 0,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0,
          count: 0,
          currency: 'USD',
        }
      );
    } catch (error) {
      throw new DBServiceSaveException(
        this,
        'Problems getting revenue for month',
        error,
      );
    }
  }

  /**
   * Get quotations by status for reporting
   */
  async getQuotationsSummaryByArtist(
    artistId: string,
    year: number,
    month: number,
  ): Promise<any> {
    try {
      const [result] = await this.quotationRepository.query(
        `SELECT 
          json_build_object(
            'total', COUNT(*),
            'accepted', COUNT(*) FILTER (WHERE q.status = 'accepted'),
            'rejected', COUNT(*) FILTER (WHERE q.status = 'rejected'),
            'pending', COUNT(*) FILTER (WHERE q.status = 'pending'),
            'responded', COUNT(*) FILTER (WHERE q.status = 'responded'),
            'canceled', COUNT(*) FILTER (WHERE q.status = 'canceled'),
            'totalRevenue', COALESCE(SUM(CASE WHEN q.status = 'accepted' THEN (q.price->>'amount')::decimal ELSE 0 END), 0),
            'averageResponseTime', COALESCE(
              AVG(
                CASE 
                  WHEN q.response_date IS NOT NULL 
                  THEN EXTRACT(EPOCH FROM (q.response_date - q.created_at)) / 3600
                  ELSE NULL 
                END
              ), 0
            )
          ) as summary
        FROM quotation q
        WHERE q.artist_id = $1
          AND EXTRACT(YEAR FROM q.created_at) = $2
          AND EXTRACT(MONTH FROM q.created_at) = $3`,
        [artistId, year, month],
      );

      return (
        result?.summary || {
          total: 0,
          accepted: 0,
          rejected: 0,
          pending: 0,
          responded: 0,
          canceled: 0,
          totalRevenue: 0,
          averageResponseTime: 0,
        }
      );
    } catch (error) {
      throw new DBServiceSaveException(
        this,
        'Problems getting quotations summary by artist',
        error,
      );
    }
  }

  /**
   * Get quotation IDs for completed events
   */
  async getQuotationIdsByEventIds(eventIds: string[]): Promise<string[]> {
    if (eventIds.length === 0) return [];

    try {
      const placeholders = eventIds.map((_, i) => `$${i + 1}`).join(', ');

      const results = await this.quotationRepository.query(
        `SELECT DISTINCT q.id
        FROM quotation q
        INNER JOIN agenda_event ae ON ae.quotation_id = q.id
        WHERE ae.id IN (${placeholders})
          AND q.status = 'accepted'`,
        eventIds,
      );

      return results.map((row: any) => row.id);
    } catch (error) {
      throw new DBServiceSaveException(
        this,
        'Problems getting quotation IDs by event IDs',
        error,
      );
    }
  }

  /**
   * Get open quotations with offers relevant for the scheduler view
   * Only returns quotations where this artist has made an offer within the date range
   */
  async getOpenQuotationsForScheduler(
    artistId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<Quotation[]> {
    try {
      // Create a cache key based on parameters
      const cacheKey = `open_quotations_scheduler_${artistId}_${fromDate.toISOString()}_${toDate.toISOString()}`;
      
      const results = await this.quotationRepository.query(
        `
        SELECT 
          q.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', qo.id,
                'createdAt', qo.created_at,
                'updatedAt', qo.updated_at,
                'quotationId', qo.quotation_id,
                'artistId', qo.artist_id,
                'estimatedCost', qo.estimated_cost,
                'estimatedDate', qo.estimated_date,
                'estimatedDuration', qo.estimated_duration,
                'message', qo.message,
                'status', qo.status,
                'messages', qo.messages
              ) ORDER BY qo.created_at
            ) FILTER (WHERE qo.id IS NOT NULL), 
            '[]'::json
          ) as offers
        FROM quotation q
        LEFT JOIN quotation_offers qo ON q.id = qo.quotation_id
        WHERE q.type = 'OPEN'
          AND q.status = 'open'
          AND EXISTS (
            -- Only include if THIS artist has an offer in the date range
            SELECT 1 FROM quotation_offers qo2
            WHERE qo2.quotation_id = q.id 
              AND qo2.artist_id = $1
              AND qo2.estimated_date >= $2 
              AND qo2.estimated_date <= $3
          )
        GROUP BY q.id
        `,
        [artistId, fromDate, toDate],
      );

      return results.map((row: any) => ({
        ...row,
        offers: row.offers || [],
      }));
    } catch (error) {
      throw new DBServiceSaveException(
        this,
        'Problems getting open quotations for scheduler',
        error,
      );
    }
  }
}

const transformEstimatedCost = (
  estimatedCost: MoneyEntity | null,
): string | null => {
  if (!estimatedCost) return null;
  return JSON.stringify(estimatedCost.toJSON());
};
