import { Injectable, Logger } from '@nestjs/common';
import { SchedulingService, AvailabilityCalendar } from '../services/scheduling.service';
import { ArtistAvailabilityQueryDto } from '../infrastructure/dtos/artistAvailabilityQuery.dto';

@Injectable()
export class GetArtistAvailabilityUseCase {
  private readonly logger = new Logger(GetArtistAvailabilityUseCase.name);

  constructor(private readonly schedulingService: SchedulingService) {}

  async execute(
    artistId: string,
    query: ArtistAvailabilityQueryDto,
  ): Promise<AvailabilityCalendar[]> {
    this.logger.log(`Getting availability for artist ${artistId}`);
    
    // Default values
    const fromDate = query.fromDate || new Date();
    const toDate = query.toDate || new Date(fromDate);
    toDate.setDate(toDate.getDate() + 30); // Default to 30 days if not specified
    
    const duration = query.duration || 60; // Default to 60 minutes
    
    return this.schedulingService.findAvailableSlots(
      artistId,
      duration,
      fromDate,
      toDate,
    );
  }
}