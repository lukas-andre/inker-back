import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../config/database/review.config';

import { Review } from './entities/review.entity';
import { ReviewAvg } from './entities/reviewAvg.entity';
import { ReviewReaction } from './entities/reviewReaction.entity';
import { ReviewProvider } from './providers/review.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Review, ReviewAvg, ReviewReaction],
      REVIEW_DB_CONNECTION_NAME,
    ),
  ],
  providers: [ReviewProvider],
  exports: [ReviewProvider],
})
export class ReviewProviderModule {}
