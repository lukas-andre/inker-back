import { BullModule } from '@nestjs/bull';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { AgendaModule } from './agenda/agenda.module';
import { AlertGateway } from './alert/alert.gateway';
import { ArtistsModule } from './artists/artists.module';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import { CustomersModule } from './customers/customers.module';
import { DatabasesModule } from './databases/database.module';
import { FollowsModule } from './follows/follows.module';
import { GenresModule } from './genres/genres.module';
import { GlobalModule } from './global/global.module';
import { HealthModule } from './health/health.module';
import { InteractionsModule } from './interactions/interactions.module';
import { LocationsModule } from './locations/locations.module';
import { MultimediasModule } from './multimedias/multimedias.module';
import { PostsModule } from './posts/posts.module';
import { NotificationQueueModule } from './queues/notifications/notification.queue.module';
import { ReactionsModule } from './reactions/reactions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SchedulerModule } from './schedulers/scheduler.module';
import { UsersModule } from './users/users.module';
import { SyncQueueModule } from './queues/sync/sync.queue.module';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
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
    PostsModule,
    ReviewsModule,
    ReactionsModule,
    UsersModule,
    NotificationQueueModule,
    SyncQueueModule,
    SchedulerModule,
  ],
  providers: [ChatGateway, AlertGateway, ModulesContainer],
})
export class AppModule implements OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name);

  onApplicationShutdown(signal: string) {
    this.logger.log(`🛑 ${signal} received, exiting now...`);
  }
}
