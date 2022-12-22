import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../databases/constants';

import { Review } from './entities/review.entity';
import { ReviewAvg } from './entities/reviewAvg.entity';
import { ReviewReaction } from './entities/reviewReaction.entity';
import { ReviewProvider } from './providers/review.provider';
import { ReviewAvgProvider } from './providers/reviewAvg.provider';
import { ReviewReactionProvider } from './providers/reviewReaction.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Review, ReviewAvg, ReviewReaction],
      REVIEW_DB_CONNECTION_NAME,
    ),
  ],
  providers: [ReviewProvider, ReviewAvgProvider, ReviewReactionProvider],
  exports: [ReviewProvider, ReviewAvgProvider, ReviewReactionProvider],
})
export class ReviewProviderModule {}
