import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MonthlyReportAggregatorService } from '../services/monthlyReportAggregator.service';
import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { queues } from '../../../queues/queues';

@Injectable()
export class MonthlyReportJob extends BaseComponent {
  constructor(
    private readonly reportAggregator: MonthlyReportAggregatorService,
    private readonly artistRepository: ArtistRepository,
    @InjectQueue(queues.notification.name) 
    private readonly notificationQueue: Queue,
  ) {
    super(MonthlyReportJob.name);
  }

  /**
   * Generate monthly reports on the 1st of every month at 9:00 AM
   */
  @Cron('0 9 1 * *')
  async generateMonthlyReports() {
    this.logger.log('Starting monthly report generation...');

    try {
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const year = lastMonth.getFullYear();
      const month = lastMonth.getMonth() + 1;

      this.logger.log(`Generating reports for ${year}-${month.toString().padStart(2, '0')}`);

      // Get all active artists
      const artists = await this.artistRepository.findActiveArtists();
      this.logger.log(`Found ${artists.length} active artists for monthly reports`);

      // Process reports for each artist
      const reportPromises = artists.map(artist => 
        this.generateReportForArtist(artist, year, month)
      );

      await Promise.allSettled(reportPromises);
      
      this.logger.log(`Monthly report generation completed for ${artists.length} artists`);
    } catch (error) {
      this.logger.error('Error generating monthly reports:', error);
    }
  }

  private async generateReportForArtist(artist: any, year: number, month: number) {
    try {
      // Generate the report data
      const reportData = await this.reportAggregator.generateArtistMonthlyReport(artist.id, year, month);
      
      if (!reportData.hasActivity) {
        this.logger.debug(`Skipping report for artist ${artist.id} - no activity in ${year}-${month}`);
        return;
      }

      // Create the report month string
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const reportMonth = `${monthNames[month - 1]} ${year}`;

      // Queue the monthly report notification
      await this.notificationQueue.add('MONTHLY_REPORT', {
        jobId: 'MONTHLY_REPORT',
        notificationTypeId: 'EMAIL',
        metadata: {
          artistId: artist.id,
          email: artist.contact?.email || artist.contactEmail,
          reportMonth,
          artistName: artist.username || `${artist.firstName} ${artist.lastName}`,
          appointments: {
            completedCount: reportData.appointments.completedCount,
            canceledCount: reportData.appointments.canceledCount,
            rescheduledCount: reportData.appointments.rescheduledCount,
            totalCount: reportData.appointments.totalCount,
            uniqueCustomers: reportData.appointments.uniqueCustomers,
          },
          reviews: {
            totalReviews: reportData.reviews.totalReviews,
            averageRating: reportData.reviews.averageRating,
            positiveReviews: reportData.reviews.positiveReviews,
            negativeReviews: reportData.reviews.negativeReviews,
          },
          quotations: {
            total: reportData.quotations.total,
            accepted: reportData.quotations.accepted,
            rejected: reportData.quotations.rejected,
            totalRevenue: reportData.quotations.totalRevenue,
          },
          performance: {
            conversionRate: reportData.performance.conversionRate,
            completionRate: reportData.performance.completionRate,
            customerSatisfaction: reportData.performance.customerSatisfaction,
          },
        }
      });

      this.logger.log(`Queued monthly report for artist ${artist.id} (${artist.username})`);
    } catch (error) {
      this.logger.error(`Failed to generate report for artist ${artist.id}:`, error);
    }
  }
} 