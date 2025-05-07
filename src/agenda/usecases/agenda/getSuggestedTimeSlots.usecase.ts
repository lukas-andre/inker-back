import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SchedulingService, TimeSlot } from '../../services/scheduling.service';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';

@Injectable()
export class GetSuggestedTimeSlotsUseCase {
  private readonly logger = new Logger(GetSuggestedTimeSlotsUseCase.name);

  constructor(
    private readonly schedulingService: SchedulingService,
    private readonly quotationProvider: QuotationRepository,
  ) {}

  async execute(quotationId: string): Promise<TimeSlot[]> {
    this.logger.log(`Getting suggested time slots for quotation ${quotationId}`);
    
    // Get the quotation to determine artist and expected duration
    const quotation = await this.quotationProvider.findOne({
      where: { id: quotationId },
      relations: ['artist'],
    });
    
    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${quotationId} not found`);
    }
    
    // Use the estimated duration from the quotation or default to 2 hours (120 minutes)
    const durationMinutes = quotation.appointmentDuration || 120;
    const artistId = quotation.artistId;
    
    // Get top 3 suggested time slots
    return this.schedulingService.suggestOptimalTimes(artistId, durationMinutes, 3);
  }
}