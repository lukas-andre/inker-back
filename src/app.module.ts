import { BullModule } from '@nestjs/bull';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';

import { AgendaModule } from './agenda/agenda.module';
import { AlertGateway } from './alert/alert.gateway';
import { AnalyticsModule } from './analytics/analytics.module';
import { ArtistsModule } from './artists/artists.module';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import { ConsentModule } from './consent-module/consent.module';
import { CustomersModule } from './customers/customers.module';
import { DatabasesModule } from './databases/database.module';
import { FollowsModule } from './follows/follows.module';
import { GenresModule } from './genres/genres.module';
import { GlobalModule } from './global/global.module';
import { HealthModule } from './health/health.module';
import { InteractionsModule } from './interactions/interactions.module';
import { LocationsModule } from './locations/locations.module';
import { MultimediasModule } from './multimedias/multimedias.module';
import { PlacesModule } from './places/places.module';
import { PostsModule } from './posts/posts.module';
import { NotificationQueueModule } from './queues/notifications/notification.queue.module';
import { PenaltyQueuesModule } from './queues/penalty/penaltyQueues.module';
import { SyncQueueModule } from './queues/sync/sync.queue.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SchedulerModule } from './schedulers/scheduler.module';
import { TattooGeneratorModule } from './tattoo-generator/tattooGenerator.module';
import { TokensModule } from './tokens/tokens.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production',
    //   port: 8000,
    // }),
    AgendaModule,
    AnalyticsModule,
    ArtistsModule,
    AuthModule,
    CustomersModule,
    DatabasesModule,
    FollowsModule,
    GenresModule,
    GlobalModule,
    HealthModule,
    InteractionsModule,
    LocationsModule,
    MultimediasModule,
    PlacesModule,
    PostsModule,
    ReviewsModule,
    // ReactionsModule,
    TattooGeneratorModule,
    TokensModule,
    UsersModule,
    NotificationQueueModule,
    SyncQueueModule,
    PenaltyQueuesModule,
    SchedulerModule,
    ConsentModule,
  ],
  providers: [ChatGateway, AlertGateway, ModulesContainer],
})
export class AppModule implements OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name);

  onApplicationShutdown(signal: string) {
    this.logger.log(`🛑 ${signal} received, exiting now...`);
  }
}
