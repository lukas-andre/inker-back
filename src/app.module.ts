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
import { LocationsModule } from './locations/locations.module';
import { MultimediasModule } from './multimedias/multimedias.module';
import { PostsModule } from './posts/posts.module';
import { ReactionsModule } from './reactions/reactions.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    GlobalModule,
    DatabasesModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    ArtistsModule,
    MultimediasModule,
    FollowsModule,
    ReactionsModule,
    PostsModule,
    TagsModule,
    GenresModule,
    AgendaModule,
    LocationsModule,
    HealthModule,
  ],
  providers: [ChatGateway, AlertGateway, ModulesContainer],
})
export class AppModule implements OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name);

  onApplicationShutdown(signal: string) {
    this.logger.log(`🛑 ${signal} received, exiting now...`);
  }
}
