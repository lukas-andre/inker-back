import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserType } from '../../../users/domain/enums/userType.enum';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import {
  CancellationPenaltyMetadata,
  PenaltyUserRole,
} from '../../infrastructure/entities/cancellationPenalty.entity';
import { PenaltyStatus, PenaltyType } from '../enum'; // Corrected path to barrel file

export interface CalculatedPenalty {
  type: PenaltyType;
  amount: number | null;
  reputationPoints: number | null;
  status: PenaltyStatus;
  metadata: Partial<CancellationPenaltyMetadata>; // Initiator and original event start will be filled later
}

@Injectable()
export class PenaltyCalculationService {
  private readonly logger = new Logger(PenaltyCalculationService.name);

  constructor(private readonly configService: ConfigService) {}

  // Placeholder for fetching quotation value if needed for percentage penalties
  private async getQuotationValue(quotationId: string | null): Promise<number> {
    if (!quotationId) return 0;
    // In a real scenario, fetch this from QuotationRepository or a QuotationService
    // This might involve an API call if quotations are in a different microservice
    this.logger.log(`Fetching quotation value for ID: ${quotationId}`);
    // Mock value for MVP
    return 100.0;
  }

  private calculateHoursDifference(date1: Date, date2: Date): number {
    if (!date1 || !date2) return Infinity;
    const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
    return diffInMilliseconds / (1000 * 60 * 60);
  }

  async calculateForUser(
    event: AgendaEvent,
    cancellingUserRole: PenaltyUserRole,
    // cancellingUserId: string, // Could be used for more specific rules in future
  ): Promise<CalculatedPenalty | null> {
    const currentTime = new Date();
    const hoursTillAppointment = this.calculateHoursDifference(
      currentTime,
      event.startDate,
    );

    let penaltyType: PenaltyType | null = null;
    let amount: number | null = null;
    let reputationPoints: number | null = null;

    // MVP Rules based on your provided matrix (simplified)
    if (cancellingUserRole === UserType.CUSTOMER) {
      // Customer cancellation rules
      if (hoursTillAppointment < 24) {
        penaltyType = PenaltyType.FIXED_FEE; // Example: fixed fee
        amount = this.configService.get<number>(
          'penalty.customer.lessThan24hFee',
          25,
        ); // Default 25
        reputationPoints = -1; // Example reputation impact
        this.logger.log(
          `Customer cancelling < 24h. Penalty: ${amount}, Rep: ${reputationPoints}`,
        );
      } else if (hoursTillAppointment < 48) {
        penaltyType = PenaltyType.FIXED_FEE; // Example: smaller fixed fee or percentage
        amount = this.configService.get<number>(
          'penalty.customer.lessThan48hFee',
          10,
        ); // Default 10
        // No reputation impact for >24h for MVP
        this.logger.log(`Customer cancelling < 48h. Penalty: ${amount}`);
      } else {
        // No penalty if > 48h for MVP
        this.logger.log('Customer cancelling > 48h. No penalty.');
        return null;
      }
    } else if (cancellingUserRole === UserType.ARTIST) {
      // Artist cancellation rules
      const quotationValue = await this.getQuotationValue(event.quotationId);
      if (hoursTillAppointment < 2) {
        // Very short notice
        penaltyType = PenaltyType.PERCENTAGE;
        const percentage = this.configService.get<number>(
          'penalty.artist.lessThan2hPercentage',
          0.2,
        ); // 20%
        amount = quotationValue * percentage;
        reputationPoints = -2;
        this.logger.log(
          `Artist cancelling < 2h. Penalty: ${amount} (${
            percentage * 100
          }%), Rep: ${reputationPoints}`,
        );
      } else if (hoursTillAppointment < 24) {
        // Short notice
        penaltyType = PenaltyType.PERCENTAGE;
        const percentage = this.configService.get<number>(
          'penalty.artist.lessThan24hPercentage',
          0.1,
        ); // 10%
        amount = quotationValue * percentage;
        reputationPoints = -1;
        this.logger.log(
          `Artist cancelling < 24h. Penalty: ${amount} (${
            percentage * 100
          }%), Rep: ${reputationPoints}`,
        );
      } else {
        // No monetary penalty if > 24h for artist for MVP, but maybe reputation hit
        // For MVP, let's say no penalty to keep it simple
        this.logger.log('Artist cancelling > 24h. No penalty for MVP.');
        return null; // Or just reputation points
      }
    }

    if (!penaltyType) {
      return null; // No penalty applicable
    }

    return {
      type: penaltyType,
      amount: amount ? parseFloat(amount.toFixed(2)) : null,
      reputationPoints,
      status: PenaltyStatus.PENDING,
      metadata: {
        userRole: cancellingUserRole,
        cancellationTime: currentTime,
        originalEventStart: event.startDate,
        // cancellationInitiatorId and appliedAt will be set by the calling use case/service
      },
    };
  }
}
