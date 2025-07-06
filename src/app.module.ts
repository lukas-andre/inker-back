import { BullModule } from '@nestjs/bull';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ModulesContainer } from '@nestjs/core';
import { OpenTelemetryModule } from 'nestjs-otel';

import { AgendaModule } from './agenda/agenda.module';
import { redisConfig } from './config/redis.config';
import { AlertGateway } from './alert/alert.gateway';
import { AnalyticsModule } from './analytics/analytics.module';
import { ArtistsModule } from './artists/artists.module';
import { AuthModule } from './auth/auth.module';
import { BetaSignupModule } from './beta-signup/betaSignup.module';
import { ChatGateway } from './chat/chat.gateway';
import { ConsentModule } from './consent-module/consent.module';
import { ContactModule } from './contact/contact.module';
import { CustomersModule } from './customers/customers.module';
import { DatabasesModule } from './databases/database.module';
import { FollowsModule } from './follows/follows.module';
import { GenresModule } from './genres/genres.module';
import { GlobalModule } from './global/global.module';
import { HealthModule } from './health/health.module';
import { InteractionsModule } from './interactions/interactions.module';
import { LocationsModule } from './locations/locations.module';
import { AppLoggerModule } from './logger/logger.module';
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
    BullModule.forRootAsync({
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>) => ({
        redis: {
          host: config.host,
          port: config.port,
          password: config.password,
          retryStrategy: (times) => {
            const delay = Math.min(times * config.retryDelay, 30000);
            return delay;
          },
          connectTimeout: config.connectTimeout,
        },
      }),
    }),
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,
        apiMetrics: {
          enable: true,
          defaultAttributes: {
            service: 'inker-backend',
          },
          ignoreRoutes: ['/health', '/metrics'],
          ignoreUndefinedRoutes: false,
        },
      },
    }),
    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production',
    //   port: 8000,
    // }),
    AppLoggerModule,
    AgendaModule,
    AnalyticsModule,
    ArtistsModule,
    AuthModule,
    BetaSignupModule,
    ContactModule,
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
