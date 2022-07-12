import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { ActivitiesService } from '../domain/services/activities.service';

@Injectable()
export class GetActivityReactionsResumeUseCase extends BaseUseCase {
  constructor(private readonly activitiesService: ActivitiesService) {
    super(GetActivityReactionsResumeUseCase.name);
  }

  async execute(
    jwtPayload: JwtPayload,
    activityId: number,
    activity: string,
  ): Promise<any> {
    const result =
      await this.activitiesService.findAllWithTotalReactionsAndReactionGroup(
        activityId,
        activity,
      );
    console.log('result: ', result);
    return result;
  }
}
