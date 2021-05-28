import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { ActivitiesService } from '../domain/services/activities.service';

@Injectable()
export class GetActivityReactionsResumeUseCase {
  private readonly logger = new Logger(GetActivityReactionsResumeUseCase.name);

  constructor(private readonly activitiesService: ActivitiesService) {}

  async execute(
    jwtPayload: JwtPayload,
    activityId: number,
    activity: string,
  ): Promise<any | DomainException> {
    const result =
      await this.activitiesService.findAllWithTotalReactionsAndReactionGroup(
        activityId,
        activity,
      );
    console.log('result: ', result);
    return result;
  }
}
