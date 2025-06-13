import { Injectable } from '@nestjs/common';
import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import { AgendaEventRepository } from '../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { ReviewRepository } from '../../../reviews/database/repositories/review.repository';
import { QuotationRepository } from '../../../agenda/infrastructure/repositories/quotation.provider';
import { BaseComponent } from '../../../global/domain/components/base.component';

@Injectable()
export class MonthlyReportAggregatorService extends BaseComponent {
  constructor(
    private readonly artistRepository: ArtistRepository,
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly quotationRepository: QuotationRepository,
  ) {
    super(MonthlyReportAggregatorService.name);
  }

  /**
   * Generate a complete monthly report for an artist by aggregating data from multiple databases
   */
  async generateArtistMonthlyReport(
    artistId: string,
    year: number,
    month: number
  ): Promise<any> {
    try {
      // 1. Get artist info from artist DB
      const artistInfo = await this.artistRepository.getArtistInfoForReport(artistId);
      if (!artistInfo) {
        throw new Error(`Artist ${artistId} not found`);
      }

      // 2. Get events summary from agenda DB
      const eventsSummary = await this.agendaEventRepository.getEventsForMonthlyReport(
        [artistId],
        year,
        month
      );
      
      const appointmentsSummary = eventsSummary[0]?.summary || {
        completedCount: 0,
        canceledCount: 0,
        rescheduledCount: 0,
        totalCount: 0,
        uniqueCustomers: 0,
      };

      // 3. Get reviews summary from reviews DB
      const reviewsSummary = await this.reviewRepository.getReviewsByArtistForMonth(
        artistId,
        year,
        month
      );

      // 4. Get quotations summary from agenda DB
      const quotationsSummary = await this.quotationRepository.getQuotationsSummaryByArtist(
        artistId,
        year,
        month
      );

      // 5. Combine all data
      return {
        reportMonth: `${year}-${month.toString().padStart(2, '0')}`,
        artist: artistInfo,
        appointments: appointmentsSummary,
        reviews: reviewsSummary,
        quotations: quotationsSummary,
        performance: {
          conversionRate: quotationsSummary.total > 0 
            ? (quotationsSummary.accepted / quotationsSummary.total * 100).toFixed(2) 
            : 0,
          completionRate: appointmentsSummary.totalCount > 0
            ? (appointmentsSummary.completedCount / appointmentsSummary.totalCount * 100).toFixed(2)
            : 0,
          customerSatisfaction: reviewsSummary.totalReviews > 0
            ? (reviewsSummary.positiveReviews / reviewsSummary.totalReviews * 100).toFixed(2)
            : 0,
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error generating monthly report for artist ${artistId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active artists who need monthly reports
   */
  async getActiveArtistsForReports(): Promise<{ id: string; email: string }[]> {
    try {
      // Get all active artists
      const artists = await this.artistRepository.findActiveArtistsForReports();
      
      // Filter artists who have had events in the last 3 months
      const artistsWithRecentActivity: { id: string; email: string }[] = [];
      
      for (const artist of artists) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        // Check if artist has any events in the last 3 months
        const recentEvents = await this.agendaEventRepository.getEventsForMonthlyReport(
          [artist.id],
          threeMonthsAgo.getFullYear(),
          threeMonthsAgo.getMonth() + 1
        );
        
        if (recentEvents.length > 0) {
          artistsWithRecentActivity.push({
            id: artist.id,
            email: artist.email,
          });
        }
      }
      
      return artistsWithRecentActivity;
    } catch (error) {
      this.logger.error('Error getting active artists for reports:', error);
      throw error;
    }
  }
} 