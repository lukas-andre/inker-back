import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../databases/constants';

import { Review } from './entities/review.entity';
import { ReviewAvg } from './entities/reviewAvg.entity';
import { ReviewReaction } from './entities/reviewReaction.entity';
import { ReviewRepository } from './repositories/review.repository';
import { ReviewAvgRepository } from './repositories/reviewAvg.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Review, ReviewAvg, ReviewReaction],
      REVIEW_DB_CONNECTION_NAME,
    ),
  ],
  providers: [ReviewRepository, ReviewAvgRepository, ],
  exports: [ReviewRepository, ReviewAvgRepository,],
})
export class ReviewRepositoryModule {}
