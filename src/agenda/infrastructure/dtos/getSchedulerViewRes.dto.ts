import { ApiProperty } from '@nestjs/swagger';

import { MoneyEntity } from '../../../global/domain/models/money.model';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import { OpenQuotationOfferDto } from '../../domain/dtos/openQuotationOffer.dto';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import {
  AvailabilityCalendar,
  TimeSlot,
} from '../../services/scheduling.service';
import { QuotationStatus, QuotationType } from '../entities/quotation.entity';

export enum SchedulerItemCategory {
  CONFIRMED = 'confirmed',
  TENTATIVE = 'tentative',
  ACTIONABLE = 'actionable',
  OPPORTUNITY = 'opportunity',
}

export class SchedulerEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: SchedulerItemCategory })
  category: SchedulerItemCategory;

  @ApiProperty({ example: 'event' })
  type: 'event';

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ enum: AgendaEventStatus })
  status: AgendaEventStatus;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty({ required: false })
  customerAvatar?: string;

  @ApiProperty({ required: false })
  quotationId?: string;

  @ApiProperty()
  isBlocking: boolean;

  @ApiProperty()
  canModify: boolean;

  @ApiProperty()
  canCancel: boolean;

  @ApiProperty()
  canReschedule: boolean;

  @ApiProperty({ required: false, type: [String] })
  conflictsWith?: string[];

  @ApiProperty({ required: false })
  workEvidence?: MultimediasMetadataInterface;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  reminderSent?: Record<string, boolean>;
}

export class SchedulerQuotationDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: SchedulerItemCategory })
  category: SchedulerItemCategory;

  @ApiProperty({ example: 'quotation' })
  type: 'quotation';

  @ApiProperty({ enum: QuotationType })
  quotationType: QuotationType;

  @ApiProperty({ enum: QuotationStatus })
  status: QuotationStatus;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty({ required: false })
  customerAvatar?: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  estimatedCost?: MoneyEntity;

  @ApiProperty({ required: false })
  proposedDate?: Date;

  @ApiProperty({ required: false })
  proposedDuration?: number;

  @ApiProperty({ required: false })
  referenceImages?: MultimediasMetadataInterface;

  @ApiProperty()
  hasConflict: boolean;

  @ApiProperty({ required: false, type: [String] })
  conflictingEventIds?: string[];

  @ApiProperty()
  actionRequired: boolean;

  @ApiProperty({ required: false })
  actionDeadline?: Date;

  @ApiProperty({ required: false, type: [OpenQuotationOfferDto] })
  offers?: OpenQuotationOfferDto[];

  @ApiProperty()
  canRespond: boolean;

  @ApiProperty()
  canSubmitOffer: boolean;
}

export class SchedulerSummaryDto {
  @ApiProperty()
  totalConfirmedEvents: number;

  @ApiProperty()
  totalTentativeEvents: number;

  @ApiProperty()
  totalActionableQuotations: number;

  @ApiProperty()
  totalOpportunities: number;

  @ApiProperty({
    required: false,
    type: 'object',
    properties: {
      startTime: { type: 'string', format: 'date-time' },
      endTime: { type: 'string', format: 'date-time' },
      density: { type: 'number' },
    },
  })
  nextAvailableSlot?: TimeSlot;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        quotationId: { type: 'string' },
        deadline: { type: 'string', format: 'date-time' },
        type: { type: 'string', enum: ['response', 'confirmation'] },
      },
    },
  })
  upcomingDeadlines: {
    quotationId: string;
    deadline: Date;
    type: 'response' | 'confirmation';
  }[];
}

export class GetSchedulerViewResDto {
  @ApiProperty({ type: [SchedulerEventDto] })
  events: SchedulerEventDto[];

  @ApiProperty({ type: [SchedulerQuotationDto] })
  quotations: SchedulerQuotationDto[];

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string' },
        slots: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              startTime: { type: 'string', format: 'date-time' },
              endTime: { type: 'string', format: 'date-time' },
              density: { type: 'number' },
            },
          },
        },
      },
    },
  })
  availability?: AvailabilityCalendar[];

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' },
        density: { type: 'number' },
      },
    },
  })
  suggestedSlots?: TimeSlot[];

  @ApiProperty({
    type: 'object',
    properties: {
      start: { type: 'string' },
      end: { type: 'string' },
      workingDays: { type: 'array', items: { type: 'string' } },
    },
  })
  workingHours: {
    start: string;
    end: string;
    workingDays: string[];
  };

  @ApiProperty({ type: SchedulerSummaryDto })
  summary: SchedulerSummaryDto;
}
