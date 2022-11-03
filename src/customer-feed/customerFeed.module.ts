import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerFeedController } from './customerFeed.controller';
import { CustomerFeed } from './customerFeed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerFeed], 'customer-feed-db')],
  controllers: [CustomerFeedController],
  providers: [CustomerFeed],
})
export class CustomerFeedModule {}
