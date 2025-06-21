import { Module } from '@nestjs/common';

import { IReputationService } from './domain/interfaces/reputationService.interface';
import { ReputationService } from './domain/services/reputation.service';
// import { UserReputationRepository } from './infrastructure/repositories/userReputation.repository'; // If you have a repository
// import { TypeOrmModule } from '@nestjs/typeorm'; // If using TypeORM entities for reputation
// import { UserReputationEntity } from './infrastructure/entities/userReputation.entity'; // If you have an entity

@Module({
  imports: [
    // TypeOrmModule.forFeature([UserReputationEntity]), // Example if using TypeORM
  ],
  providers: [
    {
      provide: IReputationService,
      useClass: ReputationService,
    },
    // UserReputationRepository, // Example if using a repository
  ],
  exports: [IReputationService],
})
export class ReputationModule {}
