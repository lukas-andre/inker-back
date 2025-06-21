import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { CancellationPenalty } from '../entities/cancellationPenalty.entity';

@Injectable()
export class CancellationPenaltyRepository extends Repository<CancellationPenalty> {
  constructor(
    @InjectDataSource(AGENDA_DB_CONNECTION_NAME)
    private dataSource: DataSource,
  ) {
    super(CancellationPenalty, dataSource.createEntityManager());
  }

  // You can add custom methods here if needed in the future, for example:
  // async findByUserIdAndStatus(userId: string, status: PenaltyStatus): Promise<CancellationPenalty[]> {
  //   return this.find({ where: { userId, status } });
  // }

  // async sumPenaltiesForUser(userId: string): Promise<number> {
  //   const { sum } = await this.createQueryBuilder('penalty')
  //     .select('SUM(penalty.amount)', 'sum')
  //     .where('penalty.userId = :userId', { userId })
  //     .andWhere('penalty.type != :reputationType', { reputationType: PenaltyType.REPUTATION_POINTS })
  //     .andWhere('penalty.status = :appliedStatus', { appliedStatus: PenaltyStatus.APPLIED })
  //     .getRawOne();
  //   return parseFloat(sum) || 0;
  // }
}
