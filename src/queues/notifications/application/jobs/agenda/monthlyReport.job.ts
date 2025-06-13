import { Injectable, Logger } from '@nestjs/common';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { MonthlyReportEmailType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { MonthlyReportJobType, MONTHLY_REPORT } from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

@Injectable()
export class MonthlyReportJob extends NotificationJob {
  private readonly logger = new Logger(MonthlyReportJob.name);

  constructor(
    emailNotificationService: EmailNotificationService,
    agendaEventProvider: AgendaEventRepository,
    artistProvider: ArtistRepository,
    customerProvider: CustomerRepository,
    locationProvider: ArtistLocationRepository,
    quotationProvider: QuotationRepository,
    pushNotificationService: PushNotificationService,
    notificationStorageService: NotificationStorageService,
  ) {
    super(
      emailNotificationService,
      agendaEventProvider,
      artistProvider,
      customerProvider,
      locationProvider,
      quotationProvider,
      pushNotificationService,
      notificationStorageService,
    );
  }

  async handle(job: MonthlyReportJobType): Promise<void> {
    const { 
      artistId, 
      email, 
      reportMonth, 
      artistName,
      appointments,
      reviews,
      quotations,
      performance 
    } = job.metadata;
    
    this.logger.log(`Handling ${MONTHLY_REPORT} for artist ${artistId}, month: ${reportMonth}`);

    try {
      // Get artist info
      const artist = await this.artistProvider.findById(artistId);
      if (!artist) {
        this.logger.error(`Artist not found for monthly report: ${artistId}`);
        return;
      }

      // Build notification content
      const title = `📊 Reporte Mensual - ${reportMonth}`;
      const message = `¡Hola ${artistName}! Tu reporte mensual está listo. Este mes completaste ${appointments.completedCount} citas con una calificación promedio de ${reviews.averageRating}⭐`;

      // Store notification for artist
      await this.notificationStorageService.storeNotification(
        artist.userId,
        title,
        message,
        MONTHLY_REPORT,
        {
          artistId,
          reportMonth,
          appointments: appointments.completedCount.toString(),
          averageRating: reviews.averageRating.toString(),
          totalRevenue: quotations.totalRevenue.toString(),
          conversionRate: performance.conversionRate,
        },
      );

      // Email notification with detailed report
      const monthlyReportEmailData: MonthlyReportEmailType = {
        to: email,
        mailId: 'MONTHLY_REPORT',
        artistName,
        reportMonth,
        appointments,
        reviews,
        quotations,
        performance,
      };

      await this.emailNotificationService.sendEmail(monthlyReportEmailData);

      // Push notification to artist
      await this.pushNotificationService.sendToUser(
        artist.userId,
        {
          title,
          body: message,
        },
        {
          type: MONTHLY_REPORT,
          artistId,
          reportMonth,
          quickStats: {
            appointments: appointments.completedCount,
            rating: reviews.averageRating,
            revenue: quotations.totalRevenue,
          },
        },
      );

      this.logger.log(`Successfully sent monthly report for artist ${artistId}, month: ${reportMonth}`);

    } catch (error) {
      const e = error as Error;
      this.logger.error(`Error handling ${MONTHLY_REPORT} for artist ${artistId}: ${e.message}`, e.stack);
    }
  }
} 